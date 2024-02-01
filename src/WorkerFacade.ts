export namespace WorkerFacade {
  export type EventType = "message" | "messageerror" | "error";

  export interface EventListeners<TMessage> {
    message: (message: TMessage) => void;
    messageerror: (error: Error) => void;
    error: (error: Error) => void;
  }
}

export interface WorkerFacade<TRequest, TResponse> {
  addListener<E extends WorkerFacade.EventType>(
    type: E,
    listener: WorkerFacade.EventListeners<TResponse>[E]
  ): void;

  removeListener<E extends WorkerFacade.EventType>(
    type: E,
    listener: WorkerFacade.EventListeners<TResponse>[E]
  ): void;

  postMessage(message: TRequest): void;
}
