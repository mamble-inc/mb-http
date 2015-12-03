import Node from './node';

export class Mime {
    static TYPES = {
        '.js'   : 'text/javascript',
        '.json' : 'application/json',
        '.css'  : 'text/css',
        '.html' : 'text/html',
        '.ts'   : 'application/x-typescript'
    };
    static getType(file){
        var ext = Node.Path.extname(file) || '.html';
        if(Mime.TYPES[ext]){
            return Mime.TYPES[ext];
        }else{
            return ext;
        }
    }
}