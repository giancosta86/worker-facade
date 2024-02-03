import { EventListenerMap, EventType, WorkerFacade } from "./WorkerFacade";

export class WebWorker<TRequest, TResponse>
  implements WorkerFacade<TRequest, TResponse>
{
  private readonly worker: Worker;

  private readonly dataListenersToEventListenersMap = new Map<
    (value: any) => void,
    any
  >();

  private constructor(scriptURL: string | URL, options?: WorkerOptions) {
    this.worker = new Worker(scriptURL, options);
  }

  addListener<E extends EventType>(
    eventType: E,
    listener: EventListenerMap<TResponse>[E]
  ): void {
    const eventListener = (event: any) => {
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

    this.dataListenersToEventListenersMap.set(listener, eventListener);

    this.worker.addEventListener(eventType, eventListener);
  }

  removeListener<E extends EventType>(
    eventType: E,
    listener: EventListenerMap<TResponse>[E]
  ): void {
    const eventListener = this.dataListenersToEventListenersMap.get(listener);

    this.worker.removeEventListener(eventType, eventListener);
  }

  postMessage(request: TRequest, ...options: readonly any[]): void {
    this.worker.postMessage(request, ...options);
  }
}
