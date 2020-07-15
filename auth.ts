import { FastifyRequest, FastifyReply } from "fastify";
type Strategy = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<{ isValid: boolean; credentials?: any }>;

export default class Auth {
  private strategies: { [key: string]: Strategy } = {};
  private _default: Strategy | null = null;

  addStrategy(name: string, strategy: Strategy) {
    if (this.strategies[name]) {
      throw new Error(`Stragegy with name "${name}" already registered`);
    }

    this.strategies[name] = strategy;
  }

  setDefault(name: string) {
    if (!this.strategies[name]) {
      throw new Error(
        `Strategy "${name}" doensn't exist. Did you register it with "addStrategy" method?`
      );
    }
    this._default = this.strategies[name];
  }

  get default() {
    return this._default;
  }

  getStrategy(name: string): Strategy | null {
    return this.strategies[name] || null;
  }
}
