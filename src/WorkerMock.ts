import { RequestListener } from "./RequestListener";
import {
  ErrorListener,
  ListenerMap,
  EventType,
  MessageListener,
  WorkerFacade
} from "./WorkerFacade";
import { SerializingChannel } from "./SerializingChannel";

export class WorkerMock<TRequest, TResponse>
  implements WorkerFacade<TRequest, TResponse>
{
  static create<TRequest, TResponse>(
    requestListener: RequestListener<TRequest, TResponse>
  ): WorkerMock<TRequest, TResponse> {
    return new WorkerMock<TRequest, TResponse>(requestListener);
  }

  private readonly listeners: Map<
    EventType,
    (MessageListener<TResponse> | ErrorListener)[]
  > = new Map([
    ["message", []],
    ["messageerror", []],
    ["error", []]
  ]);

  private readonly requestChannel = new SerializingChannel<TRequest>({
    onMessage: request => {
      try {
        this.requestListener(
          request,
          this.responseChannel.sendMessage.bind(this.responseChannel)
        );
      } catch (err) {
        this.listeners
          .get("error")!
          .forEach(listener =>
            (listener as ErrorListener)(
              err instanceof Error ? err : new Error(String(err))
            )
          );
      }
    },

    onMessageError: messageError => {
      this.listeners
        .get("messageerror")!
        .forEach(listener => (listener as ErrorListener)(messageError));
    }
  });

  private readonly responseChannel = new SerializingChannel<TResponse>({
    onMessage: response => {
      this.listeners
        .get("message")!
        .forEach(listener =>
          (listener as MessageListener<TResponse>)(response)
        );
    },

    onMessageError: messageError => {
      this.listeners
        .get("messageerror")!
        .forEach(listener => (listener as ErrorListener)(messageError));
    }
  });

  private constructor(
    private readonly requestListener: RequestListener<TRequest, TResponse>
  ) {}

  addListener<E extends EventType>(
    eventType: E,
    listener: ListenerMap<TResponse>[E]
  ): void {
    switch (eventType) {
      case "message":
      case "messageerror":
      case "error":
        this.listeners.get(eventType)!.push(listener);
        break;

      default:
        throw new Error(`Unsupported event type: ${eventType}`);
    }
  }

  removeListener<E extends EventType>(
    eventType: E,
    listener: ListenerMap<TResponse>[E]
  ): void {
    switch (eventType) {
      case "message":
      case "messageerror":
      case "error":
        this.listeners.set(
          eventType,
          this.listeners
            .get(eventType)!
            .filter(currentListener => currentListener != listener)
        );
        break;

      default:
        throw new Error(`Unsupported event type: ${eventType}`);
    }
  }

  postMessage(request: TRequest): void {
    this.requestChannel.sendMessage(request);
  }
}
