import Node from './node';
import Utils from './utils';

export class Client {
    constructor(url,headers){
        if(url){
            this.configure(url,headers)
        }
    }
    configure(url,headers){
        if(typeof url == 'string'){
            url = Node.Url.parse(url,true);
        }
        this.protocol   = url.protocol;
        this.host       = url.hostname;
        this.port       = url.port;
        this.path       = url.pathname;
        this.headers    = headers||{};
        this.streamed   = false;
        switch(url.protocol){
            case 'http:' : this.service = Node.Http;  break;
            case 'https:': this.service = Node.Https; break;
            default      : throw new Error('invalid http protocol '+url.protocol)
        }
    }
    initRequest(req){
        return (Utils.cleanup({
            method   : req.method  || 'GET',
            hostname : req.host    || this.host,
            port     : req.port    || this.port || undefined,
            headers  : Utils.merge(this.headers,req.headers),
            path     : Node.Path.resolve(this.path,req.path||'') + (req.query?'?'+Node.Qs.stringify(req.query):''),
            content  : req.content
        }));
    }
    initResponse(req, res){
        res.streamed = req.streamed || this.streamed;
        var contentType     = res.headers['content-type'];
        var contentEncoding = res.headers['content-encoding'];
        if ((
            contentType && contentType.indexOf('application/x-gzip') >= 0) ||
            contentEncoding && contentEncoding.indexOf('gzip') >= 0
        ){
            return res.pipe(Node.Zlib.createGunzip());
        } else {
            return res;
        }
    }

    encode(req){
        return req.content;
    }
    decode(res){
        return res;
    }

    onRequest(req){}
    onSuccess(req,res){}
    onFailure(req,err){}

    request(req){
        return new Promise((resolve,reject)=> {
            req = this.initRequest(req);
            this.onRequest(req);
            var request = this.service.request(req);
            request.on('error', err=> {
                err.request   = req;
                this.onFailure(req,err);
                reject(err);
            });
            request.on('response', res=> {
                var response = {
                    status  : res.statusCode,
                    message : res.statusMessage,
                    headers : res.headers
                };
                res  = this.initResponse(req,res);
                if (request.streamed) {
                    resolve({
                        stream  : req,
                        status  : res.statusCode,
                        headers : res.headers
                    })
                } else {
                    var content = new Buffer(0);
                    res.on('data', chunk=>content=Buffer.concat([content, chunk], content.length + chunk.length));
                    res.on('end', ()=>{
                        try{
                            response.content = content;
                            response = this.decode(response);
                            this.onSuccess(req,response);
                            resolve(response);
                        }catch(error){
                            this.onFailure(req,error,req);
                            reject(error);
                        }
                    });
                    res.on('error',error=>{
                        this.onFailure(req,error,req);
                        reject(error);
                    });
                }
            });
            req.content = this.encode(req) || req.content;
            if (req.content) {
                request.end(req.content);
            } else {
                request.end();
            }
        });
    }
}