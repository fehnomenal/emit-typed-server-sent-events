/// <reference types="node" />
import { type FetchEventSourceInit } from '@microsoft/fetch-event-source';
import type { EventHandlers, SseEmitter } from './types.ts';
export declare function listenToEvents<Emitter extends SseEmitter>(url: string, handlers: EventHandlers<Emitter>, init: {
    signal: AbortSignal;
} & Omit<FetchEventSourceInit, 'onmessage'>): {
    promise: Promise<void>;
};
export declare function listenToEvents<Emitter extends SseEmitter>(url: string, handlers: EventHandlers<Emitter>, init?: Omit<FetchEventSourceInit, 'onmessage'>): {
    promise: Promise<void>;
    abort: () => void;
};
