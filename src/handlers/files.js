import Node from '../node';

import {Server} from '../server';
import {Mime} from '../mime';
import {Handler} from './handler';

class FileRoute {
    constructor(settings){
        if(typeof settings=='string'){
            settings = [/^\/(.*)$/i,`${settings}/$1`];
        }
        this.pattern = settings.shift();
        this.location = settings.shift();
    }
    match(url){
        if(url.match(this.pattern)){
            return url.replace(this.pattern,this.location);
        }
    }
    toString(){
        return `Route(${this.pattern} -> ${this.location})`
    }
}
@Server.handler('files')
class FileHandler extends Handler {
    config:Object;
    constructor(){
        super();
        this.config = FileHandler.config;
        this.routes = [];
        if(typeof this.config.path=='string'){
            this.config.path=[this.config.path];
        }
        this.config.path.forEach(p=>{
            this.routes.push(new FileRoute(p));
        });
        console.info(this.routes)
    }
    resource(path){
        try {
            var stat = Node.Fs.statSync(path);
            if (stat.isDirectory()) {
                return this.resource(Node.Path.resolve(path, 'index.html'));
            } else
            if (stat.isFile()) {
                return {exist:true,path:path};
            } else {
                return {exist:false,path:path};
            }
        }catch(e){
            return {exist:false,path:path};
        }
    }
    accept(req,res){

    }
    handle(req,res){
        for(var file,i=0;i<this.routes.length;i++){
            file = this.routes[i].match(req.url);
            if(file && (file = this.resource(file)).exist){
                break;
            }
        }
        if(file && file.exist){
            res.writeHead(200,{
                'Content-Type': Mime.getType(file.path)
            });
            res.stream = Node.Fs.createReadStream(file.path);
        }else{
            res.writeHead(404,{
                'Content-Type': Mime.getType(file?file.path:'req.url')
            });
            res.end('File Not Found');
        }
    }
}