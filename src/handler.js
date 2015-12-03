export default class HttpHandler {
    get settings(){
        return this.$.settings;
    }
    constructor(settings){
        this.configure(settings)
    }
    configure(settings):Handler{
        this.$ = {
            settings : settings
        };
        return this;
    }
    initialize(server){
        console.info(`Initializeing ${this.constructor.name}`);
    }
    handle(req,res){
        throw new Error(`Unimplemented Method 'handler' in class ${this.constructor.name}`)
    }
}


