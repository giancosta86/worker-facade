export type EventType = "message" | "messageerror" | "error";

export type MessageListener<T> = (message: T) => void;

export type ErrorListener = (error: Error) => void;

export interface EventListenerMap<TMessage> {
  message: MessageListener<TMessage>;
  messageerror: ErrorListener;
  error: ErrorListener;
}

export interface WorkerFacade<TRequest, TResponse> {
  addListener<E extends EventType>(
    eventType: E,
    listener: EventListenerMap<TResponse>[E]
  ): void;

  removeListener<E extends EventType>(
    eventType: E,
    listener: EventListenerMap<TResponse>[E]
  ): void;

  postMessage(request: TRequest, ...options: readonly any[]): void;
}
