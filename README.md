# emit-typed-server-sent-events

This library contains helpers to convert events from a node.js event emitter to a event stream for [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) and handle them on the client side with type safety (via `@microsoft/fetch-event-source`).

## Installation

Choose the one for your package manager.

```sh
npm install 'github:fehnomenal/emit-typed-server-sent-events#semver:v1.0.0'
```

```sh
yarn install 'github:fehnomenal/emit-typed-server-sent-events#semver:v1.0.0'
```

```sh
pnpm install 'github:fehnomenal/emit-typed-server-sent-events#semver:v1.0.0'
```

```sh
bun add 'github:fehnomenal/emit-typed-server-sent-events#semver:v1.0.0'
```

## Server side

1. Create an event emitter (optionally with typed events which I recommend).
2. Configure an event streamer that filters events and optionally maps the data to send. The filter functions can optionally access a context argument.
3. Respond to requests.

```ts
import { defineMapFor } from 'emit-typed-server-sent-events';
import EventEmitter from 'node:events';

// 1. Create an event emitter (optionally with typed events which I recommend).
const jobEmitter = new EventEmitter<{
  start: [id: string];
  progress: [id: string, current: number, total: number];
  finish: [id: string];
}>();

// 2. Configure an event streamer.
const jobStreamer = defineMapFor(jobEmitter)
  // You have to specify which events to handle.
  .switchEvents({
    // We do not care about the `start` event and omit it here.

    // We want to throttle the rate of `progress` events.
    progress(id, current, total) {
      const percent = current / total;
      if (percent % 5 === 0) {
        // Needs either a const assertion or a specific return type. Otherwise the type at the
        // frontend would be (string | number)[].
        return [id, percent] as const;
      }

      // Skip this event.
      return false;
    },

    // Pass the data of the `finish` event unaltered.
    finish: true,
  });

// 3. Respond to requests. This is a sveltekit server endpoint but the library should work
// everywhere you can return a web response.
export const GET = (event) => {
  // Optionally check authentication.

  return jobStreamer.streamEvents();
};

// Now emit events into your emitter to pass them to listening clients.
jobEmitter.emit('start', 'job-1');
jobEmitter.emit('progress', 'job-1', 1, 100);
jobEmitter.emit('finish', 'job-1');

// Export for the frontend.
export type { jobStreamer };
```

You can also call `defineMapFor(..).withContext<{ ... }>()` to get access to a context value inside the event forwarding functions.
In this example from a chat application only message events shall be streamed that belong to the current chat window:

```ts
const messageEmitter = new EventEmitter<{
  msg: [chatId: string, message: string];
}>();

const messageStreamer = defineMapFor(messageEmitter)
  .withContext<{ chatId: string }>()
  .switchEvents({
    msg(chatId, _message, ctx) {
      return chatId === ctx.chatId;
    },
  });

export const GET = (event) => {
  return messageStreamer.streamEvents({ chatId: event.params.chat_id });
};

export type { messageStreamer };
```

## Client side

Call `listenToEvents` with the url to your endpoint, a map of event handlers and optionally config that is passed to `@microsoft/fetch-event-source`.
The event handler arguments are typed from the sse emitter.

```ts
import { listenToEvents } from 'emit-typed-server-sent-events';
import type { jobStreamer } from './server.js';

const sse = listenToEvents<typeof jobStreamer>(
  '/endpoint/url',
  {
    progress(id, percent) {
      if (percent === 0) {
        console.log('started job', id);
      } else {
        console.log('job progress', id, percent.toLocaleString(undefined, { style: 'percent' }));
      }
    },
    finish(id) {
      console.log('finished job', id);
    },
  },
  {
    // @microsoft/fetch-event-source config
    // signal: ...
  },
);

// You can await the connection.
await sse.promise;

// You can abort the event source. This is only available if you didn't pass a `signal` to the `listenToEvents` call.
sse.abort();
```

# Development and publishing

```sh
> bun i
> # work work work
> git add ...
> git commit
> bun changeset
> bun version
> bun run build
> npm2git c
> git push
> git push --tags
```
