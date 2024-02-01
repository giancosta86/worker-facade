import { SerializingChannel } from "./SerializingChannel";

describe("Serializing channel", () => {
  describe("when sending a serializable message", () => {
    it("should call just the message event listener", () => {
      const messageListener = jest.fn();
      const messageErrorListener = jest.fn();

      const channel = new SerializingChannel<number>({
        onMessage: messageListener,
        onMessageError: messageErrorListener
      });

      channel.sendMessage(90);

      expect(messageListener).toHaveBeenCalledExactlyOnceWith(90);
      expect(messageErrorListener).not.toHaveBeenCalled();
    });
  });

  describe("when sending a non-serializable message", () => {
    it("should call just the message-error event listener", () => {
      const messageListener = jest.fn();
      const messageErrorListener = jest.fn();

      const channel = new SerializingChannel<unknown>({
        onMessage: messageListener,
        onMessageError: messageErrorListener
      });

      channel.sendMessage(() => "Functions are not serializable");

      expect(messageListener).not.toHaveBeenCalled();
      expect(messageErrorListener).toHaveBeenCalledOnce();
    });
  });
});
