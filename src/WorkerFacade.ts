export namespace WorkerFacade {
  export type EventType = "message" | "messageerror" | "error";

  export interface EventListenerMap<TMessage> {
    message: (message: TMessage) => void;
    messageerror: (error: Error) => void;
    error: (error: Error) => void;
  }
}

export interface WorkerFacade<TRequest, TResponse> {
  addListener<E extends WorkerFacade.EventType>(
    eventType: E,
    listener: WorkerFacade.EventListenerMap<TResponse>[E]
  ): void;

  removeListener<E extends WorkerFacade.EventType>(
    eventType: E,
    listener: WorkerFacade.EventListenerMap<TResponse>[E]
  ): void;

  postMessage(request: TRequest): void;
}
