export namespace WorkerFacade {
  export type EventType = ("message" | "messageerror" | "error") &
    keyof WorkerEventMap;

  export type EventListener<K extends EventType> = (
    this: WorkerFacade,
    event: WorkerEventMap[K]
  ) => unknown;
}

export interface WorkerFacade<TRequest = unknown> {
  addEventListener<E extends WorkerFacade.EventType>(
    type: E,
    listener: WorkerFacade.EventListener<E>,
    ...options: readonly any[]
  ): void;

  removeEventListener<E extends WorkerFacade.EventType>(
    type: E,
    listener: WorkerFacade.EventListener<E>,
    ...options: readonly any[]
  ): void;

  postMessage(message: TRequest, ...options: readonly any[]): void;
}
