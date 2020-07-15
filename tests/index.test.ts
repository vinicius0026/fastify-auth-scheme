import fastify from "fastify";
import fastifyAuthScheme from "../index";

async function buildServer() {
  const server = fastify();
  await server.register(fastifyAuthScheme);
  return server;
}

describe("Fastify Auth Scheme plugin tests", () => {
  test("Plugin decorates server with auth object", async () => {
    const server = await buildServer();
    expect(server.auth);
  });
  test("Replys with 401 if default strategy and failed auth", async () => {
    const server = await buildServer();
    server.auth.addStrategy("custom", async (request, reply) => {
      return { isValid: false };
    });
    server.auth.setDefault("custom");
    server.get("/", async (request, reply) => {
      return "resp";
    });
    const response = await server.inject({
      method: "GET",
      url: "/",
    });

    expect(response.statusCode).toBe(401);
  });

  test("Ignores default strategy if config.auth is equal to false at route level", async () => {
    const server = await buildServer();
    server.auth.addStrategy("custom", async (request, reply) => {
      return { isValid: false };
    });
    server.auth.setDefault("custom");
    server.get("/", { config: { auth: false } }, async (request, reply) => {
      return "resp";
    });
    const response = await server.inject({
      method: "GET",
      url: "/",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("resp");
  });

  test("Ignores default strategy if config.auth is equal to false at route level even if auth would pass", async () => {
    const server = await buildServer();
    server.auth.addStrategy("custom", async (request, reply) => {
      return { isValid: true };
    });
    server.auth.setDefault("custom");
    server.get("/", { config: { auth: false } }, async (request, reply) => {
      expect(request.auth).toBeNull();
      return "resp";
    });
    const response = await server.inject({
      method: "GET",
      url: "/",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("resp");
  });

  test("Ignores default strategy if config.auth is equal to 'try' at route level and authentication fails", async () => {
    const server = await buildServer();
    server.auth.addStrategy("custom", async (request, reply) => {
      return { isValid: false };
    });
    server.auth.setDefault("custom");
    server.get("/", { config: { auth: "try" } }, async (request, reply) => {
      return "resp";
    });
    const response = await server.inject({
      method: "GET",
      url: "/",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("resp");
  });

  test("Sets request.auth if config.auth is equal to 'try' at route level and authentication succeeds", async () => {
    const server = await buildServer();
    server.auth.addStrategy("custom", async (request, reply) => {
      return { isValid: true, credentials: "cred" };
    });
    server.auth.setDefault("custom");
    server.get("/", { config: { auth: "try" } }, async (request, reply) => {
      expect(request.auth).not.toBeNull();
      expect(request.auth?.credentials).toEqual("cred");
      return "resp";
    });
    const response = await server.inject({
      method: "GET",
      url: "/",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("resp");
  });

  test("uses specific auth strategy defined at route level if previously registered", async () => {
    const server = await buildServer();
    server.auth.addStrategy("custom", async (request, reply) => {
      return { isValid: false };
    });
    server.auth.setDefault("custom");
    server.auth.addStrategy("token", async (request, reply) => {
      return { isValid: true, credentials: "cred" };
    });
    server.get("/", { config: { auth: "token" } }, async (request, reply) => {
      expect(request.auth).not.toBeNull();
      expect(request.auth?.credentials).toEqual("cred");
      return "resp";
    });
    const response = await server.inject({
      method: "GET",
      url: "/",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("resp");
  });

  test("Returns error if invalid auth strategy at route level", async () => {
    const server = await buildServer();
    server.auth.addStrategy("custom", async (request, reply) => {
      return { isValid: true, credentials: "cred" };
    });
    server.auth.setDefault("custom");
    server.get("/", { config: { auth: "token" } }, async (request, reply) => {
      return "resp";
    });
    const response = await server.inject({
      method: "GET",
      url: "/",
    });
    expect(response.statusCode).toBe(500);
  });

  test("Ignores auth if no default strategy and no route-level strategy", async () => {
    const server = await buildServer();
    server.auth.addStrategy("custom", async (request, reply) => {
      return { isValid: false };
    });
    server.get("/", async (request, reply) => {
      return "resp";
    });
    const response = await server.inject({
      method: "GET",
      url: "/",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("resp");
  });
});
