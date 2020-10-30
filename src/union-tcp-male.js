let net = require('net')
let uuid = require('uuid')

app = {}

app.createNew = function (conf) {
    function getDateStr() {
        return (new Date()).toLocaleString();
    }

    function logs(msg, type = 'INFO') {
        console.log(`[${getDateStr()}] [${type}] - ${msg}`)
    }

    function delsocketbyid(l, id) {
        //console.log(l)
        for (let i = l.length - 1; i >= 0; i--) {
            if (l[i].id == id) {
                l.splice(i, 1)
            }
        }
    }
    let client = net.connect(conf);

    client.on('connect', () => {
        let msg =JSON.stringify({cmd:'login',id:conf.id,dt1:getDateStr()})
        client.write(msg);        
        logs('famale connect ok', 'connect')
    });
    client.on('error', (err) => {
        logs(err, 'error')
    });
    client.on('close', () => {
        logs(`connect to ${conf.host}:${conf.port} is closed`, 'close')
    });
    
    let list = []
    client.on('data', (data) => {
        try {
            let id = uuid.v1()
            let r = JSON.parse(data.toString())
            //console.log(r)
            if (r.cmd == 'createTrunking') {
                let caok = 0
                let cbok = 0
                let ca = net.connect(r.local.port, r.local.ip, () => {
                    caok = 1
                    //返回map 服务器，并打通连接
                    console.log(r)
                    ca.write(JSON.stringify({ id: r.id }))
                    logs(`connect to ${r.local.ip}:${r.local.port} ok`, 'connect')
                    if (caok && cbok) {
                        ca.pipe(cb)
                        cb.pipe(ca)
                        list.push({ s0: ca, s1: cb, id, d0: new Date() })
                    }
                })
                let cb = net.connect(r.remote.port, r.remote.ip, () => {
                    cbok = 1
                    //返回map 服务器
                    logs(`connect to ${r.remote.ip}:${r.remote.port} ok`)
                    if (caok && cbok) {
                        //ca.write(JSON.stringify({ id: r.id }))
                        ca.pipe(cb)
                        cb.pipe(ca)
                        list.push({ s0: ca, s1: cb, id, d0: new Date() })
                    }
                })
                ca.on('error', (err) => {
                    logs(`connect to ${r.local.ip}:${r.local.port} err:` + err, 'error')
                })

                ca.on('close', () => {
                    try {
                        //client.write(JSON.stringify({ id: r.id, cmd: 'close' }))
                        logs(`connect to ${r.local.ip}:${r.local.port} closed`, 'close')
                        if (ca) ca.destroy();
                        if (cb) cb.destroy();
                        delsocketbyid(list, id);
                    } catch (e) {
                        logs(e)
                    }
                })

                cb.on('error', (err) => {
                    logs(`connect to ${r.remote.ip}:${r.remote.port} closed` + err, 'error')
                })

                cb.on('close', (err) => {
                    try {
                        logs(`connect to ${r.remote.ip}:${r.remote.port} closed`, 'close')
                        client.write(JSON.stringify({ id: r.id, cmd: 'close' }))
                        if (ca) ca.destroy();
                        if (cb) cb.destroy();
                        delsocketbyid(list, id)
                    } catch (e) {
                        logs(e)
                    }
                })

            }
        } catch (e) {
            console.log(e)
        }
    });

    client.on('connect', () => {
        logs(`${conf.host}:${conf.port} connected!`, 'connect');
        //client.write(sendmsg)
    });

    setInterval(() => {
        if (client && !client.destroyed) {
            let msg =JSON.stringify({cmd:'heart',id:conf.id,dt1:getDateStr()})
            client.write(msg);
            //logs(msg)        
        } else {
            if (!client.connecting) {
                logs('reconnect to famale  .... ')
                client.connect(conf)
            }
        }
    }, 10000);
}

module.exports = app;