import { server } from "./server";

const PORT =  8080;
const HOST = '0.0.0.0'

const start =  async () => {
    try{

        await server.listen({port:PORT,host:HOST})
    }catch(err:any){
        server.log.error(err);
        process.exit(1)
    }
}

start()
