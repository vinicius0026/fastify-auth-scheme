import fp from "fastify-plugin";
import Auth from "./auth";

declare module "fastify" {
  interface FastifyInstance {
    auth: Auth;
  }
  interface FastifyRequest {
    auth: {
      credentials: any;
    } | null;
  }
}

export default fp(
  async (server, options) => {
    server.decorate("auth", new Auth());
    server.decorateRequest("auth", null);
    server.addHook("preHandler", async (request, reply) => {
      const config = reply.context.config as any;
      const defaultStrategy = server.auth.default;
      let strategy = defaultStrategy;

      if (config && config.auth === false) {
        return;
      }

      if (typeof config.auth === "string" && config.auth !== "try") {
        strategy = server.auth.getStrategy(config.auth);
        if (!strategy) {
          throw new Error(`Invalid auth strategy ${config.auth}`);
        }
      }

      if (!strategy) {
        return;
      }

      const { isValid, credentials } = await strategy(request, reply);

      if (!isValid && config.auth === "try") {
        return;
      }

      if (!isValid) {
        return reply.status(401).send();
      }

      request.auth = {
        credentials,
      };
    });
  },
  { fastify: "3.x", name: "fastify-auth-scheme" }
);
