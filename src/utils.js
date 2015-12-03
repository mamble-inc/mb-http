export class Utils {
    merge(...args){
        return this.patch({},...args);
    }
    patch(...args){
        var n,o = args.shift();
        while(args.length){
            n = args.shift();
            if(typeof n=='object' && n){
                Object.keys(n).forEach(k=>{
                    o[k] = n[k];
                })
            }
        }
        return o;
    }
    cleanup(object){
        for(var i in object){
            var v = object[i];
            if(
                typeof v=='undefined' ||
                v==null || v=='' ||
                (Array.isArray(v) && v.length==0) ||
                (typeof v=='object' && Object.keys(v).length==0)
            ){
                delete object[i];
            }
        }
        return object;
    }
}

export default new Utils();