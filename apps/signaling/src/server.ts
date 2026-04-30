import fastifyWebsocket  from "@fastify/websocket";
import fastify from "fastify";

const server = fastify({logger:true});

server.register(fastifyWebsocket);

const peers = new Map<string, any>();


server.register(async (fastify) => {
    fastify.get("/ws/:id", {websocket:true},(socket,req) => {
        const peerId = (req.params as any).id;

        peers.set(peerId,socket)

        socket.on('message', (message:Buffer) => {
            try{
                const data = JSON.parse(message.toString());
                const {target,type ,payload} = data;
                const targetSocket = peers.get(target)

                if(targetSocket && targetSocket.readyState === 1){
                    target.send(JSON.stringify({
                        from:peerId,
                        type,
                        payload
                    }));
                }
            }catch(err:any){
                fastify.log.error('Error procesando el mensaje: ',err.msg );
            }
        });
        socket.on('close',()=>{
            peers.delete(peerId);
            fastify.log.info(`Peer desconectado : ${peerId}`)
        });
    });
});


export {server}