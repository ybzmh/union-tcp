let net = require('net')
let uuid = require('uuid')

let app = {}

app.createNew = function (config) {
    let unions = []
    let males =[]
//------------------函数
    //按ID 从列表中获取socket
    function getunionbyid(id) {
        for (let i = 0; i < unions.length; i++) {
            if (unions[i].id == id) return unions[i]
        }
        return null;
    }
    function addunion(i) {
        unions.push(i);
    }



    function delunionbyid(id) {
        for (let i = unions.length - 1; i >= 0; i--) {
            if (unions[i].id == id) {
                if (unions[i].insocket) unions[i].insocket.destroy()
                if (unions[i].outsocket) unions[i].outsocket.destroy()
                unions.splice(i, 1)
            }
        }
        logs('unions count:' + unions.length)
    }

    function delmalesbyid(id) {
        for (let i = males.length - 1; i >= 0; i--) {
            if (males[i].maleid == id) {
                males[i].destroy()
                males.splice(i, 1)
            }
        }
        logs('males count:' + unions.length)
    }

    function getmalesbyid(id) {
        for (let i = males.length - 1; i >= 0; i--) {
            if (males[i].maleid == id) {
                if (!males[i].destroyed) {
                    return males[i]
                }
            }
        }
        logs('not males:' + id)
        males.map(i=>{console.log(i.maleid)})
        return null
    }
    
    function getDateStr() {
        return (new Date()).toLocaleString();
    }

    function logs(msg, type = 'INFO') {
        console.log(`[${getDateStr()}] [${type}] - ${msg}`)
    }

    //接入服务端口
    for (let i = 0; i < config.maps.length; i++) {
        let conf0 = config.maps[i]
        let srv0 = net.createServer((c) => {
            let id = uuid.v1()
            addunion({ id, insocket: c, remote: conf0.remote })
            //根据 配置的ID找到接入的male socket
            let socket= getmalesbyid(conf0.remote.id)
            //console.log(socket)
            if (socket && !socket.destroyed) {
                let sendmsg = JSON.stringify({ cmd: 'createTrunking', id: id, local: { ip: config.out.host, port: config.out.port }, remote: conf0.remote })
                logs(`[local->${socket.localAddress}:${socket.localPort}==remote->${socket.remoteAddress}:${socket.remotePort}]  send:` + sendmsg, 'data');
                socket.write(sendmsg)
            } else {
                c.destroy()
            }
            c.on('close', () => {
                logs(`IN SERVER remote->${c.remoteAddress}:${c.remotePort}]  close`, 'close');
                delunionbyid(id);
            })
            c.on('error', (err) => {
                logs('unions count:' + unions.length)
                //logs(id)
                //unions.map(i => { logs(i.id) })
                delunionbyid(id);
                logs(`IN SERVER remote->${c.remoteAddress}:${c.remotePort}]  error:` + err, 'error');
            });
        });
        srv0.listen(conf0.port, () => {
            logs(`IN Server started ${conf0.port}`);
        });
    }



    //控制协议服务
    let srv1 = net.createServer((c) => {
          
        logs(`CONTROL SERVER remote->${c.remoteAddress}:${c.remotePort}]  connect`, 'connect');
        c.on('error', (err) => {
            logs(`CONTROL SERVER remote->${c.remoteAddress}:${c.remotePort}]  error:` + err, 'error');
        });

        c.on('close', () => {
            logs(`CONTROL SERVER remote->${c.remoteAddress}:${c.remotePort}]  closed`, 'close');
            c.destroy()
            if (c.maleid ) {
                delmalesbyid(c.maleid)
                logs(c.maleid+' deleted')
            }            
        })
        c.on('data', data => {
            let r
            logs(`CONTROL SERVER remote->${c.remoteAddress}:${c.remotePort}] recieve:` + data.toString());
            try {
                try {
                r = JSON.parse(data.toString())
                if (r.cmd == 'close') {

                }
                if (r.cmd == 'login') {

                   c.maleid =r.id  
                   males.push(c)          
                   logs(r.id+' male login ok')
                }
            } catch (e) {
                c.destroy();
                logs('CONTROL SERVER'+e)
            }
                
            } catch (e) {

            }
            // c.write(JSON.stringify({cmd:"ok"}))
        })
    });

    srv1.listen(config.in.port, () => {
        logs(`CONTROL Server start ${config.in.port}`);
    });


    //OUT SERVER 通道服务
    let srv2 = net.createServer((c) => {
        let union = { remote: { ip: '', port: 0 } }
        let id
        let icount = 0;
        c.on('error', (err) => {
            logs(`OUT SERVER remote->${union.remote.ip}:${union.remote.port}  error:` + err, 'error');
        });
        // c.on('close', () => {
        //     logs(`OUT SERVER remote->${c.remoteAddress}:${c.remotePort}]  closed` , 'close');
        // });

        c.on('data', data => {
            //如果是第一个包，获取id0,g根据id0 得到 socket,
            if (icount == 0) {
                //console.log(data.toString())
                let r 
                try {
                    r = JSON.parse(data.toString())
                } catch(e) {
                    c.destroy();
                    logs('OUT SERVER:'+e) 
                    return 
                }
                if (!r.id) {
                    c.destroy()
                    return
                }
                id = r.id
                union = getunionbyid(id)
                union.outsocket = c
                //通道建立成功
                logs(`path: ${union.insocket.localPort} to ${union.remote.ip}:${union.remote.port} binding ok`)
                c.on('close', () => {
                    logs(`OUT SERVER remote->${union.remote.ip}:${union.remote.port}  close`, 'close');
                    delunionbyid(id)
                });
                if (union) {
                    //转发数据
                    union.insocket.on('data', data => {
                        //logs(data.toString())
                        c.write(data)
                    })
                } else { c.destroy() }
            } else {
                //执行数据转发
                union.insocket.write(data)

            }
            icount++
        })

    });
    srv2.listen(config.out.port, () => {
        logs(`OUT Server start ${config.out.port}`);
    });

}
module.exports = app