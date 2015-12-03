import {Client} from './client';
import {Server} from './server';
export {
    Server as HttpServer,
    Client as HttpClient
}
export default {
    version : '0.0.1',
    Client  : Client,
    Server  : Server
};