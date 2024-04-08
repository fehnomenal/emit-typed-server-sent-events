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
2. Convert the emitter to a sse emitter and decide which events and data to emit.
3. Respond to requests.

```ts
import { makeSseEmitter } from 'emit-typed-server-sent-events';
import { EventEmitter } from 'node:events';

// 1. Create an event emitter (optionally with typed events which I recommend).
const emitter = new EventEmitter<{
  start: [id: string];
  progress: [id: string, current: number, total: number];
  finish: [id: string];
}>();

// 2. Convert the emitter to a sse emitter. You have to specify which events to handle and can
// optionally transform the data to send. In this example we do not care about the `start` event
// and want to throttle the rate of `progress` events.
// This is exported so we can use it on the client with a type import.
export const streamEvents = makeSseEmitter(emitter, {
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

  // Pass the data for the `finish` event unaltered.
  finish: true;
});

// 3. Respond to requests. This is a sveltekit server endpoint but the library should work everywhere
// you can return a web response.
export const GET = (event) => {
  // Optionally check authentication.

  return streamEvents()
};

// Now emit events into your emitter to pass them to listening clients.
emitter.emit('start', 'job-1');
```

## Client side

Call `listenToEvents` with the url to your endpoint, a map of event handlers and optionally config that is passed to `@microsoft/fetch-event-source`.
The event handler arguments are typed from the sse emitter.

```ts
import { listenToEvents } from 'emit-typed-server-sent-events';
import type { streamEvents } from './server.js';

const sse = listenToEvents<typeof streamEvents>('/endpoint/url', {
  progress(id, percent) {
    if (percent === 0) {
      console.log('started job', id);
    } else {
      console.log('job progress', id, percent.toLocaleString(undefined, { style: 'percent' }));
    }
  },
  finish(id) {
    console.log('finished job', id);
  }
});
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
