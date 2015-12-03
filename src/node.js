export default class Node {
    static require(path):Function {
        if(typeof System!='undefined'){
            return System._nodeRequire(path);
        }else{
            return require(path)
        }
    }
    static get Http():Object{
        return this.require('http');
    }
    static get Https():Object{
        return this.require('https');
    }
    static get Fs():Object{
        return this.require('fs');
    }
    static get Path():Object{
        return this.require('path');
    }
    static get Url():Object{
        return this.require('url');
    }
    static get Qs():Object{
        return this.require('querystring');
    }
    static get Zlib():Object{
        return this.require('zlib');
    }
}