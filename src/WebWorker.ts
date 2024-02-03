import {
  ErrorListener,
  ListenerMap,
  EventType,
  MessageListener,
  WorkerFacade
} from "./WorkerFacade";

export class WebWorker<TRequest, TResponse>
  implements WorkerFacade<TRequest, TResponse>
{
  private readonly worker: Worker;

  private readonly eventListenersByListenersMap = new Map<
    MessageListener<TResponse> | ErrorListener,
    (event: any) => void
  >();

  private constructor(scriptURL: string | URL, options?: WorkerOptions) {
    this.worker = new Worker(scriptURL, options);
  }

  addListener<E extends EventType>(
    eventType: E,
    listener: ListenerMap<TResponse>[E]
  ): void {
    const eventListener = (event: MessageEvent | ErrorEvent) => {
      switch (eventType) {
        case "message":
          listener((event as MessageEvent).data);
          break;

        case "messageerror":
          listener((event as MessageEvent).data);
          break;

        case "error":
          listener((event as ErrorEvent).error);
          break;
      }
    };

    this.eventListenersByListenersMap.set(listener, eventListener);

    this.worker.addEventListener(eventType, eventListener);
  }

  removeListener<E extends EventType>(
    eventType: E,
    listener: ListenerMap<TResponse>[E]
  ): void {
    const eventListener = this.eventListenersByListenersMap.get(listener);

    if (!eventListener) {
      return;
    }

    this.worker.removeEventListener(eventType, eventListener);
  }

  postMessage(request: TRequest, ...options: readonly any[]): void {
    this.worker.postMessage(request, ...options);
  }
}
