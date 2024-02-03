export namespace SerializingChannel {
  export type Settings<T> = Readonly<{
    onMessage: (message: T) => void;
    onMessageError: (messageError: Error) => void;
  }>;
}

export class SerializingChannel<T> {
  constructor(private readonly settings: SerializingChannel.Settings<T>) {}

  sendMessage(message: T): void {
    const { onMessage, onMessageError } = this.settings;

    let clonedMessage;
    try {
      clonedMessage = structuredClone(message);
    } catch (err) {
      onMessageError(err as Error);
      return;
    }

    onMessage(clonedMessage);
  }
}
