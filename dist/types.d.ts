/// <reference types="node" />
/// <reference types="node" />
import type EventEmitter from 'node:events';
export type EmitterEvents<Emitter extends EventEmitter> = Emitter extends EventEmitter<infer Events> ? Events : [never];
export type EventsSwitchMap<Emitter extends EventEmitter, Events extends EmitterEvents<Emitter> = EmitterEvents<Emitter>> = Events extends [never] ? Record<string, EventFilterMap> : {
    [E in keyof Events]?: Events[E] extends unknown[] ? EventFilterMap<Events[E]> : never;
};
export type EventFilterMap<A extends any[] = any[]> = true | ((...args: A) => boolean | unknown[]);
export type SseEmitter<Emitter extends EventEmitter = EventEmitter, _Map extends EventsSwitchMap<Emitter> = EventsSwitchMap<Emitter>> = () => Response;
export type EventHandlers<SE extends SseEmitter> = SE extends SseEmitter<infer Emitter, infer Map> ? Map extends EventsSwitchMap<Emitter, infer Events> ? {
    [E in keyof Map as Map[E] extends false ? never : E]?: Listener<Map[E] extends true ? GetKey<E, Events> : Map[E] extends (...args: never[]) => unknown ? ReturnsOnlyBoolean<Map[E]> extends true ? GetKey<E, Events> : Exclude<ReturnType<Map[E]>, boolean> : never>;
} : never : never;
type Listener<A> = A extends unknown[] ? (...args: A) => void : never;
type GetKey<K, T> = K extends keyof T ? T[K] : never;
type ReturnsOnlyBoolean<T extends (...args: never[]) => unknown> = Exclude<ReturnType<T>, boolean> extends never ? true : false;
export {};
