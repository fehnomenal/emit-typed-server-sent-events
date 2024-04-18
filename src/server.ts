import { stringify } from 'devalue';
import type { EventEmitter } from 'node:events';
import type { DefaultCtx, DefaultEventSwitchMap, EmitterEvents, EventsSwitchMap } from './types.ts';

export const defineMapFor = <Emitter extends EventEmitter>(emitter: Emitter) =>
  new MapDefiner<Emitter, DefaultCtx>(emitter);

class MapDefiner<Emitter extends EventEmitter, Ctx> {
  #emitter: Emitter;

  constructor(emitter: Emitter) {
    this.#emitter = emitter;
  }

  withContext<Context>() {
    return this as unknown as MapDefiner<Emitter, Context>;
  }

  switchEvents<Map extends EventsSwitchMap<Ctx, EmitterEvents<Emitter>>>(map: Map) {
    return new EventStreamer<Emitter, Ctx, Map>(this.#emitter, map);
  }
}

export class EventStreamer<
  Emitter extends EventEmitter,
  Ctx,
  Map extends EventsSwitchMap<Ctx, EmitterEvents<Emitter>>,
> {
  #emitter: Emitter;
  #map: Map;

  constructor(emitter: Emitter, map: Map) {
    this.#emitter = emitter;
    this.#map = map;
  }

  streamEvents(...args: [Ctx] extends [DefaultCtx] ? [] : [ctx: Ctx]) {
    const [ctx] = args;
    const self = this;

    let eventListeners: Record<string, (...args: unknown[]) => void> = {};

    const stream = new ReadableStream({
      start(controller) {
        for (const [name, handler] of Object.entries(self.#map as DefaultEventSwitchMap)) {
          const listener = (...args: unknown[]) => {
            let result: boolean | unknown[];

            if (handler === true || (result = handler(...args, ctx)) === true) {
              sendEvent(name, args, controller);
            } else if (Array.isArray(result)) {
              sendEvent(name, result, controller);
            }
          };

          eventListeners[name] = listener;
          self.#emitter.on(name, listener);
        }
      },

      cancel() {
        for (const [name, listener] of Object.entries(eventListeners)) {
          delete eventListeners[name];
          self.#emitter.off(name, listener);
        }

        eventListeners = {};
      },
    });

    return new Response(stream, {
      headers: {
        'content-type': 'text/event-stream',
      },
    });
  }
}

const encoder = new TextEncoder();

const sendEvent = (name: string, payload: unknown[], controller: ReadableStreamDefaultController) => {
  controller.enqueue(encoder.encode(`event:${name}\ndata:${stringify(payload)}\n\n`));
};
