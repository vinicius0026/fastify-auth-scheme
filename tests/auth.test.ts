import Auth from "../auth";
import { FastifyRequest, FastifyReply } from "fastify";

describe("Auth class tests", () => {
  test("Allows adding strategies", () => {
    const auth = new Auth();
    const strategy = async (request: FastifyRequest, reply: FastifyReply) => {
      return { isValid: true, credentials: {} };
    };
    auth.addStrategy("custom", strategy);

    expect(auth.getStrategy("custom")).toEqual(strategy);
  });
  test("Allows setting default", () => {
    const auth = new Auth();
    const strategy = async (request: FastifyRequest, reply: FastifyReply) => {
      return { isValid: true, credentials: {} };
    };
    auth.addStrategy("custom", strategy);
    auth.setDefault("custom");

    expect(auth.default).toEqual(strategy);
  });
  test("addStrategy throws if name already taken", () => {
    const auth = new Auth();
    const strategy = async (request: FastifyRequest, reply: FastifyReply) => {
      return { isValid: true, credentials: {} };
    };
    auth.addStrategy("custom", strategy);
    const newStrategy = async (
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      return { isValid: false };
    };
    const t = () => {
      auth.addStrategy("custom", newStrategy);
    };
    expect(t).toThrow();
  });
  test("setDefault throws if given strategy name doesnt exist", () => {
    const auth = new Auth();
    const t = () => {
      auth.setDefault("non-existent");
    };
    expect(t).toThrow();
  });
});
