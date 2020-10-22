let famale = require('./src/union-tcp-famale')
let hostip ='10.10.13.43'
let config = {
    in: { host: hostip, port: 60001 },
    out: { host: hostip, port: 60002 },
    maps:[
        { port: 60000, remote: { ip: "10.0.135.223", port: 1521 } },
        { port: 60004, remote: { ip: "10.0.133.218", port: 3389 } },
    ]
}
famale.createNew(config)

