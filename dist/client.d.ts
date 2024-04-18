/// <reference types="node" />
/// <reference types="node" />
import { type FetchEventSourceInit } from '@microsoft/fetch-event-source';
import type { EventEmitter } from 'node:events';
import type { EventStreamer } from './server.ts';
import type { EventHandlers, EventsSwitchMap } from './types.ts';
export declare function listenToEvents<Streamer extends EventStreamer<EventEmitter, never, EventsSwitchMap<never, never>>>(url: string, handlers: EventHandlers<Streamer>, init: {
    signal: AbortSignal;
} & Omit<FetchEventSourceInit, 'onmessage'>): {
    promise: Promise<void>;
};
export declare function listenToEvents<Streamer extends EventStreamer<EventEmitter, never, EventsSwitchMap<never, never>>>(url: string, handlers: EventHandlers<Streamer>, init?: Omit<FetchEventSourceInit, 'onmessage'>): {
    promise: Promise<void>;
    abort: () => void;
};
