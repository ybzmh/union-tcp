```javascript

//母头 网络 连接器 使用例子

//--------------------------------
let famale = require('./src/union-tcp-famale')
let localip ='10.10.13.43'
let config = {
    in: { host: localip, port: 60001 },
    out: { host: localip, port: 60002 },
    maps:[
        { port: 60000, remote: { ip: "10.0.135.223", port: 1521 } },
        { port: 60004, remote: { ip: "10.0.133.218", port: 3389 } },
    ]
}
famale.createNew(config)

//公头 网络 连接器 使用例子

//--------------------------------------------
let male = require('./src/union-tcp-male')
let conf = {host: "10.10.13.43", port: 60001 }
male.createNew(conf)


//公头连接器和母头连接分别部署在不同的机器上，可以用于映射各种网络端口
```






