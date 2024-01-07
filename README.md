# worker-facade

_Message-passing TypeScript utilities for Worker_

![GitHub CI](https://github.com/giancosta86/worker-facade/actions/workflows/publish-to-npm.yml/badge.svg)
[![npm version](https://badge.fury.io/js/@giancosta86%2Fworker-facade.svg)](https://badge.fury.io/js/@giancosta86%2Fworker-facade)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](/LICENSE)

**worker-facade** is a **TypeScript** library of utilities designed to simplify message-based interaction with `Worker` instances, as well as their implementation:

- The `WorkerFacade` interface includes only a subset of `Worker`'s methods: the ones for _message passing_, from the perspective of _clients_

- The `RequestListener` function type turns the implementation of a worker into a one-liner, while enabling the creation of mocks (already implementing the `WorkerFacade` interface) via the [worker-mock](https://github.com/giancosta86/worker-mock) library

## Installation

The package on NPM is:

> @giancosta86/worker-facade

The public API entirely resides in the root package index, so one shouldn't reference specific modules.

## Usage

The practical aspects of this library can be summarized as follows:

- when you need to interact with a `Worker` via messages, pass its clients the `WorkerFacade` interface instead of the `Worker` itself - because:

  - `WorkerFacade` is structurally supported by `Worker`, but provides less methods

  - in tests, you can mock the worker by instantiating a `WorkerMock` - provided by the [worker-mock](https://github.com/giancosta86/worker-mock) package

- declare the **body** of your worker as a function compatible with the `RequestListener` function type - that is, taking these parameters:

  - the **request** itself

  - a **sendResponse(response)** function - that can be called as many times as required, to send response messages

  This way:

  - in the worker script, just call `RequestListener.register(self, <your listener function>)` - without having to take care of message events

  - when mocking the worker, especially in tests, just call `WorkerMock.create(<your listener function>)` to have a full-fledged mock

## API documentation

### WorkerFacade

`WorkerFacade<TRequest=unknown>` is an interface providing just the methods required to perform _message passing_ with any kind of `Worker` instance:

- [postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage) - sending a _request_ message, of type `TRequest`, to the worker interface; you must pass the **message** itself, which will be wrapped into a dedicated event.

* [addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) - only supporting the `message`, `messageerror` and `error` events - expressed by the `WorkerFacade.EventType` union type; listeners are called when the worker _responds_

- [removeEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) - used to remove a listener for one of the supported event types

`WorkerFacade` is a subset of `Worker`'s interface - and it is also explicitly implemented by `WorkerMock`, in the [worker-mock](https://github.com/giancosta86/worker-mock) package.

#### WorkerFacade.EventType

Union type defining the only events supported by this message-passing facade:

- `message`

- `messageerror`

- `error`

#### WorkerFacade.EventListener

Should you need to store message-related event listeners into callback variables, you can use the `WorkerFacade.EventListener` function type - which is focused on the events supported by `WorkerFacade`.

### RequestListener

`RequestListener<TRequest, TResponse>` is a type describing a function with 2 arguments:

- a **request**, of type `TRequest` - the actual data (_not_ the event) that must be processed

- a `ResponseSender` - actually, a function whose first parameter is a **response** to be sent to the client

`RequestListener` is an abstraction used to:

- simplify the actual implementation of a `Worker`

- enable the creation of a mock, in the [worker-mock](https://github.com/giancosta86/worker-mock) package

## Further references

- [worker-mock](https://github.com/giancosta86/worker-mock) - Minimalist Worker mocks in TypeScript
