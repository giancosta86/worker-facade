/* eslint-disable @typescript-eslint/no-var-requires */

export type ResponseSender<TResponse> = (
  response: TResponse,
  ...options: readonly any[]
) => void;

export type RequestListener<TRequest, TResponse> = (
  request: TRequest,
  sendResponse: ResponseSender<TResponse>
) => void;

export namespace RequestListener {
  export function register<TRequest, TResponse>(
    globalSelf: (Window & typeof globalThis) | undefined,
    listener: RequestListener<TRequest, TResponse>
  ): void {
    if (globalSelf) {
      registerWebWorker(globalSelf, listener);
    } else {
      registerWorkerThread(listener);
    }
  }
}

function registerWebWorker<TRequest, TResponse>(
  globalSelf: Window & typeof globalThis,
  listener: RequestListener<TRequest, TResponse>
): void {
  globalSelf.addEventListener("message", event => {
    const request = event.data as TRequest;
    listener(request, globalSelf.postMessage);
  });
}

function registerWorkerThread<TRequest, TResponse>(
  listener: RequestListener<TRequest, TResponse>
): void {
  const { parentPort } = require("node:worker_threads");

  if (!parentPort) {
    throw new Error("NodeJS infrastructure not available!");
  }

  parentPort.addListener("message", (request: TRequest) => {
    listener(request, response => parentPort.postMessage(response));
  });
}
