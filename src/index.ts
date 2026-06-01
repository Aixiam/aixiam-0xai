import { DurableObject } from "cloudflare:workers";

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/** A Durable Object's behavior is defined in an exported Javascript class */
export class MyDurableObject extends DurableObject<Env> {
  /**
   * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
   * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
   *
   * @param ctx - The interface for interacting with Durable Object state
   * @param env - The interface to reference bindings declared in wrangler.jsonc
   */
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  /**
   * Internal method to check rate limits for this Durable Object instance.
   * Throws an error if the limit is exceeded.
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const limit = 100; // 100 requests per minute per ID

    let data: { count: number; start: number } | undefined = await this.ctx.storage.get("rate_limit");

    if (!data || (now - data.start) > windowMs) {
      data = { count: 1, start: now };
    } else {
      data.count++;
    }

    await this.ctx.storage.put("rate_limit", data);

    if (data.count > limit) {
      throw new Error("Rate limit exceeded");
    }
  }

  /**
   * The Durable Object exposes an RPC method sayHello which will be invoked when a Durable
   *  Object instance receives a request from a Worker via the same method invocation on the stub
   *
   * @returns The greeting to be sent back to the Worker
   */
  async sayHello(): Promise<string> {
    await this.checkRateLimit();

    try {
      let result = this.ctx.storage.sql
        .exec("SELECT 'Hello, World!' as greeting")
        .one() as { greeting: string };
      return result.greeting;
    } catch (e) {
      console.error("Durable Object SQL Error:", e);
      throw new Error("Database Operation Failed");
    }
  }
}

export default {
  /**
   * This is the standard fetch handler for a Cloudflare Worker
   *
   * @param request - The request submitted to the Worker from the client
   * @param env - The interface to reference bindings declared in wrangler.jsonc
   * @param ctx - The execution context of the Worker
   * @returns The response to be sent back to the client
   */
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Security: Validate pathname to prevent abuse and ensure predictable DO IDs.
    // Allow alphanumeric characters, slashes, underscores, and dashes. Max length 128.
    if (!/^[a-zA-Z0-9/_-]+$/.test(pathname) || pathname.length > 128) {
      return new Response("Invalid request path. Only alphanumeric characters, underscores, and dashes are allowed, up to 128 characters.", { status: 400 });
    }

    try {
      // Create a `DurableObjectId` for an instance of the `MyDurableObject`
      // class. The name of class is used to identify the Durable Object.
      // Requests from all Workers to the instance named
      // will go to a single globally unique Durable Object instance.
      const id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(pathname);

      // Create a stub to open a communication channel with the Durable
      // Object instance.
      const stub = env.MY_DURABLE_OBJECT.get(id);

      // Call the `sayHello()` RPC method on the stub to invoke the method on
      // the remote Durable Object instance
      const greeting = await stub.sayHello();

      return new Response(greeting);
    } catch (e: any) {
      if (e.message === "Rate limit exceeded") {
        return new Response("Too Many Requests", { status: 429 });
      }

      console.error("Worker Fetch Error:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
