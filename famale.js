let famale = require('./src/union-tcp-famale')
let config = {
    in: { host: "0.0.0.0", port: 60001 },
    out: { host: "127.0.0.1", port: 60002 },
    maps:[
        { port: 60000, remote: { ip: "10.0.135.223", port: 1521 } },
        { port: 60004, remote: { ip: "10.0.133.218", port: 3389 } },
    ]
}
famale.createNew(config)
