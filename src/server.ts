import { stringify } from 'devalue';
import type { EventEmitter } from 'node:events';
import type { EventsSwitchMap, SseEmitter } from './types.ts';

const encoder = new TextEncoder();

export const makeSseEmitter =
  <Emitter extends EventEmitter, Map extends EventsSwitchMap<Emitter>>(
    emitter: Emitter,
    eventsSwitchMap: Map,
  ): SseEmitter<Emitter, Map> =>
  () => {
    let eventListeners: Record<string, (...args: unknown[]) => void> = {};

    const stream = new ReadableStream({
      start(controller) {
        for (const [name, handler] of Object.entries(eventsSwitchMap)) {
          const listener = (...args: unknown[]) => {
            let result: boolean | unknown[];

            if (handler === true || (result = handler(...args)) === true) {
              sendEvent(name, args, controller);
            } else if (Array.isArray(result)) {
              sendEvent(name, result, controller);
            }
          };

          eventListeners[name] = listener;
          emitter.on(name, listener);
        }
      },

      cancel() {
        for (const [name, listener] of Object.entries(eventListeners)) {
          delete eventListeners[name];
          emitter.off(name, listener);
        }

        eventListeners = {};
      },
    });

    return new Response(stream, {
      headers: {
        'content-type': 'text/event-stream',
      },
    });
  };

const sendEvent = (name: string, payload: unknown[], controller: ReadableStreamDefaultController) => {
  const data = [`event:${name}`, `data:${stringify(payload)}`];

  controller.enqueue(encoder.encode(`${data.join('\n')}\n\n`));
};
