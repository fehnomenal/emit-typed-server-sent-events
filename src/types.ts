import type EventEmitter from 'node:events';
import type { EventStreamer } from './server.ts';

type EventMap<T> = Record<keyof T, any[]> | DefaultEventMap;
type DefaultEventMap = [never];
export type DefaultCtx = [never];

export type EmitterEvents<Emitter extends EventEmitter> =
  Emitter extends EventEmitter<infer Events> ? Events : DefaultEventMap;

export type DefaultEventSwitchMap = Record<string, EventFilterMap>;

export type EventsSwitchMap<Ctx, Events extends EventMap<unknown>> = [Events] extends [DefaultEventMap]
  ? DefaultEventSwitchMap
  : {
      [E in keyof Events]?: Events[E] extends unknown[] ? EventFilterMap<Ctx, Events[E]> : never;
    };

export type EventFilterMap<Ctx = DefaultCtx, A extends unknown[] = any[]> =
  | true
  | ([Ctx] extends [DefaultCtx]
      ? (...args: A) => boolean | unknown[]
      : (...args: [...A, ctx: Ctx]) => boolean | unknown[]);

export type EventHandlers<
  Streamer extends EventStreamer<EventEmitter, never, EventsSwitchMap<never, never>>,
> =
  Streamer extends EventStreamer<infer Emitter, infer _Ctx, infer Map>
    ? Map extends DefaultEventSwitchMap
      ? {
          [E in keyof Map]?: Listener<
            Map[E] extends true
              ? GetKey<E, EmitterEvents<Emitter>>
              : Map[E] extends (...args: never[]) => unknown
                ? ReturnsOnlyBoolean<Map[E]> extends true
                  ? GetKey<E, EmitterEvents<Emitter>>
                  : Exclude<ReturnType<Map[E]>, boolean>
                : never
          >;
        }
      : never
    : never;

type Listener<A> = A extends unknown[] ? (...args: A) => void : never;

type GetKey<K, T> = K extends keyof T ? T[K] : never;

type ReturnsOnlyBoolean<T extends (...args: never[]) => unknown> =
  Exclude<ReturnType<T>, boolean> extends never ? true : false;
