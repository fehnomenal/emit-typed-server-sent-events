import { fetchEventSource, type FetchEventSourceInit } from '@microsoft/fetch-event-source';
import { parse } from 'devalue';
import type { EventHandlers, SseEmitter } from './types.ts';

export function listenToEvents<Emitter extends SseEmitter>(
  url: string,
  handlers: EventHandlers<Emitter>,
  init: { signal: AbortSignal } & Omit<FetchEventSourceInit, 'onmessage'>,
): {
  promise: Promise<void>;
};

export function listenToEvents<Emitter extends SseEmitter>(
  url: string,
  handlers: EventHandlers<Emitter>,
  init?: Omit<FetchEventSourceInit, 'onmessage'>,
): {
  promise: Promise<void>;
  abort: () => void;
};

export function listenToEvents<Emitter extends SseEmitter>(
  url: string,
  handlers: EventHandlers<Emitter>,
  init: Omit<FetchEventSourceInit, 'onmessage'> = {},
) {
  let abortController: AbortController | undefined;
  let { signal } = init;

  if (!signal) {
    abortController = new AbortController();
    init.signal = signal;
  }

  const promise = fetchEventSource(url, {
    ...init,

    onmessage({ event: name, data }) {
      const handler = (handlers as Partial<Record<string, (...args: unknown[]) => void>>)[name];
      if (handler) {
        handler(parse(data));
      }
    },
  });

  return {
    promise,
    abort: () => abortController?.abort(),
  };
}
