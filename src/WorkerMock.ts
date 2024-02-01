import { RequestListener } from "./RequestListener";
import { WorkerFacade } from "./WorkerFacade";
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
    WorkerFacade.EventType,
    ((value: any) => void)[]
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
            listener(err instanceof Error ? err : new Error(String(err)))
          );
      }
    },

    onMessageError: messageError => {
      this.listeners
        .get("messageerror")!
        .forEach(listener => listener(messageError));
    }
  });

  private readonly responseChannel = new SerializingChannel<TResponse>({
    onMessage: response => {
      this.listeners.get("message")!.forEach(listener => listener(response));
    },

    onMessageError: messageError => {
      this.listeners
        .get("messageerror")!
        .forEach(listener => listener(messageError));
    }
  });

  private constructor(
    private readonly requestListener: RequestListener<TRequest, TResponse>
  ) {}

  addListener<E extends WorkerFacade.EventType>(
    eventType: E,
    listener: WorkerFacade.EventListenerMap<TResponse>[E]
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

  removeListener<E extends WorkerFacade.EventType>(
    eventType: E,
    listener: WorkerFacade.EventListenerMap<TResponse>[E]
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
