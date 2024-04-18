/// <reference types="node" />
import type { EventEmitter } from 'node:events';
import type { DefaultCtx, EmitterEvents, EventsSwitchMap } from './types.ts';
export declare const defineMapFor: <Emitter extends EventEmitter<[never]>>(emitter: Emitter) => MapDefiner<Emitter, DefaultCtx>;
declare class MapDefiner<Emitter extends EventEmitter, Ctx> {
    #private;
    constructor(emitter: Emitter);
    withContext<Context>(): MapDefiner<Emitter, Context>;
    switchEvents<Map extends EventsSwitchMap<Ctx, EmitterEvents<Emitter>>>(map: Map): EventStreamer<Emitter, Ctx, Map>;
}
export declare class EventStreamer<Emitter extends EventEmitter, Ctx, Map extends EventsSwitchMap<Ctx, EmitterEvents<Emitter>>> {
    #private;
    constructor(emitter: Emitter, map: Map);
    streamEvents(...args: [Ctx] extends [DefaultCtx] ? [] : [ctx: Ctx]): import("undici-types").Response;
}
export {};
