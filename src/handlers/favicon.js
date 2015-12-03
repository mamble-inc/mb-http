import BaseHandler from '../handler';

export default class FaviconHandler extends BaseHandler {
    handle(req,res){
        if(req.url=='/favicon.ico'){
            res.writeHead(200,{
                'Content-Type': 'image/x-icon'
            });
            res.end(new Buffer([
                'AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAA',
                'AAAgAAAAAAAAAAAAAAAEAAAAAAAAAAkU1cAKDc4ABjL2wAM3/IAAA',
                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                'AAAAAAAAAERERERERERESIiIzMzMzIRIiIjMBMBExEiIiMxMxMzES',
                'IiIzEzEzMRIiIjERMBExEiIiMxMzMzESIiIzEzMzMRIiIjMTMzMxE',
                'iIiMzMzMzESIiIiIiIiIRIiIiIiIiIhEiIiIiIiIiESIiIiIiIiIR',
                'IiIiIiIiIhEREREREREREAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
            ].join(),'base64'),'binary');
        }
    }
}