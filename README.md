# fastify-auth-scheme

Inspired by hapi authentication flow, this plugin allows registering authentication strategies in your fastify server, define a default strategy that will be applied to all routes and override the default strategy at the route level.

This plugin doesn't implement any authentication strategies though, that's up to you to define.

## Usage

To use `fastify-auth-scheme` you need to register it in your fastify instance and add some auth strategies, like so:

```typescript
import fastify from "fastify";
import fastifyAuthScheme from "fastify-auth-scheme";

const server = fastify();
await server.register(fastifyAuthScheme);

server.auth.addStrategy("my-auth-strategy", async (request, reply) => {
  // do your auth logic here
  // if authenticated properly, return { isValid: true, credentials: userCreds }
  // otherwise return { isValid: false }
  return { isValid: false };
});

// register default strategy for all routes
server.auth.setDefault("my-auth-strategy");

// register your routes
server.get("/", async (request, reply) => {
  // only accessible for authenticated users
  // the returned credentials will be available in request.auth.credentials
  return `hello ${request.auth.credentials}`;
});

// route level configuration of auth - this route will no require authentication
server.get("/no-auth", { config: { auth: false } }, async (request, reply) => {
  return "no auth";
});
```

## Auth Strategy API

To register a new strategy, you need to give it a unique name and a function to handle the authentication.

The authentication function must take in the `request` and `reply` objects from fastify and return

```typescript
interface AuthStrategyReturn {
  isValid: boolean; // whether the authentication succeeded
  credentials?: any; // the credentials for the authenticated user
}
```

After you register a strategy, you can make it default by calling `server.auth.setDefault(<auth name>)`. This will apply the default auth strategy to all routes that don't have an override config.

## Route level configuration

You can define route-level authentication by passing a config object to the route, like so:

```typescript
server.get("/", { config: { auth: AuthConfig } }, routeHandler);
```

The AuthConfig is one of:

- `false`: this disables authentication for this route, preventing default authentication strategy from being applied
- `"try"`: this option will still run the default strategy (if registered) and will set the user credentials in the request if authentication succeeds, but it will not prevent access to the route if authentication fails (in which case the request.auth will be null).
- `<strategy name>`: by passing a strategy name to `auth` config, you can override the default auth scheme and use a specific one to a given route.

If nothing is passed to auth config, the default auth will be used.

## LICENSE

MIT License

Copyright (C) 2020 Vinicius Teixeira <vinicius0026@gmail.com>
