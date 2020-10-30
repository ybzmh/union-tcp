let famale = require('./src/union-tcp-famale')
let config = {
    in: { host: "0.0.0.0", port: 60001 },
    out: { host: "218.89.69.23", port: 60002 },
    maps:[
        { port: 60003, remote: { id:'tjy',ip: "127.0.0.1", port: 8080} },
        { port: 60004, remote: { id:'tjy',ip: "10.0.133.218", port: 3389 }},
    ]
}
famale.createNew(config)
