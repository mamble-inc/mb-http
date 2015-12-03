import Node from './node';

export class Server {
    static initResponse(res) {
    }
    static initRequest(req) {
    }
    static handlers = Object.create(null);
    static handler(name){
        return handler=>{
            Object.defineProperty(Server.handlers,name,{
                enumerable:true,
                value : handler
            })
        }
    }
    handlers:Object;
    constructor(config){
        this.config = config;
        this.handlers = Object.create(null);
        this.doUpgrade = this.doUpgrade.bind(this);
        this.doRequest = this.doRequest.bind(this);
    }
    start(){
        Object.keys(this.config).forEach(name=>{
            if(Server.handlers[name]){
                this.handlers[name] = new (Server.handlers[name].configure(this,this.config[name]))();
            }
        });
        this.server = new Node.Http.Server();
        this.server.on('upgrade',this.doUpgrade);
        this.server.on('request',this.doRequest);
        this.server.listen(this.config.port,this.config.host);
        return this;
    }
    doUpgrade(){}
    doRequest(req,res){
        if(this.config.debug){
            console.info(req.method,req.url);
        }
        Server.initRequest(req);
        Server.initResponse(res);
        var chain = new Promise((resolve,reject)=>{
            var body = new Buffer(0);
            req.on('data',(chunk)=>{
                body=Buffer.concat([body,chunk],body.length+chunk.length);
            });
            req.on('end',()=>{
                req.body = body;
                resolve();
            });
        });
        Object.keys(this.handlers).forEach(name=>{
            var handler = this.handlers[name];
            chain = chain.then(()=>{
                if(!res.finished){
                    if(typeof handler.handle=='function'){
                        return handler.handle(req,res);
                    }
                }else{
                    return true;
                }
            });
        });
        chain.then (
            s=>{
            if(res.stream){
                res.stream.pipe(res);
            }else{
                res.end()
            }
        },
            e=>{
            console.error(e.stack);
            res.writeHead(500,{
                'Content-Type': 'text/plain'
            });
            res.end(e.stack);
        }
        );
        return chain;
    }
}