import { server } from "./server";

const PORT = parseInt(process.env.PORT || "8080", 10);
const HOST = process.env.HOST || "0.0.0.0";

const start = async () => {
  try {
    await server.listen({ port: PORT, host: HOST });
    server.log.info(`Signaling server running on ${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
