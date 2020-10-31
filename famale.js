let famale = require('./index').famale
let publicip ='127.0.0.1'
let config = {
    in: { host: "0.0.0.0", port: 60001 },
    out: { host: publicip, port: 60002 },
    maps:[
        { port: 60003, remote: { id:'tjy',ip: "127.0.0.1", port: 8080} },
        { port: 60004, remote: { id:'tjy',ip: "10.0.133.218", port: 3389 }},
    ]
}
famale.createNew(config)
