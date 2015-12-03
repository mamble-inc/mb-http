import Node from '../node';
import {Server} from '../server';
import {Mime} from '../mime';
import {Handler} from './handler';
import {Result} from '../rest';

export class RestRoute {
    static methods = ['GET','POST','PUT','PATCH','DELETE','HEAD'];
    constructor(resource,action,path){
        this.resource = resource;
        this.action = action;
        this.method = action.toUpperCase();
        this.path   = path;
        this.params = [];
        this.regexp = [];
        path.split('/').forEach(part=>{
            if(part[0]==':'){
                this.params.push(part.substring(1));
                this.regexp.push('([^\\/]+)');
            }else
            if(part[0]=='*'){
                this.params.push(part.substring(1));
                this.regexp.push('(.*)');
            }else{
                this.regexp.push(part);
            }
        });
        this.regexp = new RegExp('^'+this.method+'\\s+'+this.regexp.join('\\/').toLowerCase()+'$');
    }
    match(path){
        return path.match(this.regexp);
    }
    toJSON(){
        return {
            method    : this.method,
            path      : this.path,
            resource  : this.resource.name+'.'+this.action,
            params    : this.params,
            regexp    : this.regexp.toString()
        }
    }
    toString(){
        return 'Route('+this.regexp.toString()+')';
    }
}

@Server.handler('rest')
export class RestHandler extends Handler {
    static routes = {};
    static register(path,resource){
        Object.getOwnPropertyNames(resource.prototype).forEach(method=>{
            if(RestRoute.methods.indexOf(method.toUpperCase())>=0){
                var route = new RestRoute(resource,method,path);
                var routeId = route.toString();
                if(!this.routes[routeId]){
                    this.routes[routeId] = route;
                }else{
                    route = this.routes[routeId];
                    throw new Error("Cant route '%1 %2' to %3.%4 it's already bounded to %5.%6".format(
                        method.toUpperCase(),
                        path,
                        resource.name,
                        method,
                        route.resource.name,
                        route.action
                    ));
                }
            }
        });
    }
    constructor(){
        super();
        this.config = RestHandler.config;
    }
    accept(req,res){

    }
    handle(req,res){
        var url = Node.Url.parse(req.url,true);
        var root = this.config.path;
        var method = req.method.toUpperCase();
        var headers = req.headers;
        var query = url.query;
        if(url.pathname==root){
            res.writeHead(200,{
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                routes:RestHandler.routes,
                config:RestHandler.config
            }));
        } else
        if(url.pathname.indexOf(root)==0){
            var route,matched,path = method+' '+url.pathname.replace(root,'').toLowerCase();

            for(var r in RestHandler.routes){
                route = RestHandler.routes[r];
                if(matched = route.match(path)){
                    break;
                }
            }
            if(matched){

                matched.shift();
                var match = route.toJSON();
                match.params = {};
                match.query = query;
                match.headers = headers;
                route.params.forEach((p,i)=>{
                    match.params[p] = matched[i];
                });
                var resource = new route.resource();
                //resource.path = match.params;
                //resource.method = match.params;
                //resource.params = match.params;

                var promise = Promise.resolve(
                    (req.body&&req.body.length)
                        ?JSON.parse(req.body.toString())
                        :null
                );
                promise = promise.then(body=>{
                    resource.headers = match.headers;
                    resource.query = match.query;
                    resource.params = match.params;
                    if(body){
                        matched.push(body);
                    }
                    return route.resource.prototype[route.action].apply(resource,matched);
                });

                promise = promise.then(result=>{
                    if(result == null || typeof result == 'undefined'){
                        return Result.create({
                            error   : 'Resource Not Found',
                            code    : 404
                        },404);
                    }
                    if(result instanceof Result){
                        return result;
                    }else{
                        return Result.create(JSON.stringify(result,null,'  '),200,{
                            'Content-Type': 'application/json'
                        });
                    }
                });
                promise = promise.catch(result=>{
                    if(result == null || typeof result == 'undefined'){
                        return Result.create({
                            error   : 'Resource Not Found',
                            code    : 404
                        },404);
                    }
                    if(result instanceof Result){
                        return result;
                    }else
                    if(result instanceof Error){
                        return Result.create({
                            error   : result.message,
                            code    : result.code||500,
                            details : result.details,
                            stack   : result.stack.split("\n")
                        },500);
                    }else{
                        return Result.create({
                            error   : 'Unknown Server Error',
                            code    : 500,
                            data    : result
                        },500);
                    }
                });
                promise = promise.then(result=>{
                    res.writeHead(result.status,result.headers);
                    res.end(result.value);
                });

                return promise;
            }else{
               // console.info(path,res);
                res.writeHead(404,{
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({
                    error   : 'Invalid Resource',
                    code    : 404
                }));
            }

        }
    }
}

