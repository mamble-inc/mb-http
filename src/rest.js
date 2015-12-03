import {RestHandler} from './handlers/rest';

export function Rest(path){
    return resource => {
        RestHandler.register(path,resource);
    }
}

export class Result {
    static create(value,status=200,headers={}){
        return new Result(value,status,headers);
    }
    constructor(value,status=200,headers={}){
        this.value=value;
        this.status = status;
        this.headers = headers;
    }
}
