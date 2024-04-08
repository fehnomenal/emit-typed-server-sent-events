/// <reference types="node" />
import type { EventEmitter } from 'node:events';
import type { EventsSwitchMap, SseEmitter } from './types.ts';
export declare const makeSseEmitter: <Emitter extends EventEmitter<[never]>, Map extends EventsSwitchMap<Emitter>>(emitter: Emitter, eventsSwitchMap: Map) => SseEmitter<Emitter, Map>;
