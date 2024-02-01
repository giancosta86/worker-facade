import { WorkerMock } from "./WorkerMock";

type Bear = Readonly<{
  name: string;
  age: number;
  callback?: () => string;
}>;

type Park = Readonly<{
  bearCount: number;
}>;

type TestRequest = Bear;
type TestResponse = Bear | Park;

namespace YellowstoneWorker {
  export function getFirstResponse(request: Bear): Bear {
    return {
      name: "Bubu",
      age: request.age - 3
    };
  }

  export const secondResponse: Park = {
    bearCount: 2
  };

  export function create(): WorkerMock<TestRequest, TestResponse> {
    return WorkerMock.create((message, sendResponse) => {
      sendResponse(getFirstResponse(message));

      sendResponse(secondResponse);
    });
  }
}

describe("Mock worker", () => {
  const goodRequest = { name: "Yogi", age: 38 };

  const badRequest = {
    ...goodRequest,
    callback: () => "Functions are not serializable"
  };

  describe("construction", () => {
    it("should work", () => {
      const worker = YellowstoneWorker.create();

      expect(worker).toHaveProperty("postMessage");
    });
  });

  describe("processing a request", () => {
    describe("when the request is serializable", () => {
      it("should call the message listeners", () => {
        const worker = YellowstoneWorker.create();

        const firstListener = jest.fn();
        const secondListener = jest.fn();

        worker.addListener("message", firstListener);
        worker.addListener("message", secondListener);

        worker.postMessage(goodRequest);

        [firstListener, secondListener].forEach(listener => {
          expect(listener.mock.calls).toEqual([
            [YellowstoneWorker.getFirstResponse(goodRequest)],
            [YellowstoneWorker.secondResponse]
          ]);
        });
      });

      it("should not call the messageerror listeners", () => {
        const worker = YellowstoneWorker.create();

        const listener = jest.fn();

        worker.addListener("messageerror", listener);

        worker.postMessage(goodRequest);

        expect(listener).not.toHaveBeenCalled();
      });

      it("should not call the error listeners", () => {
        const worker = YellowstoneWorker.create();

        const listener = jest.fn();

        worker.addListener("error", listener);

        worker.postMessage(goodRequest);

        expect(listener).not.toHaveBeenCalled();
      });
    });

    describe("when the request is NOT serializable", () => {
      it("should call the messageerror listeners", () => {
        const worker = YellowstoneWorker.create();

        const firstListener = jest.fn();
        const secondListener = jest.fn();

        worker.addListener("messageerror", firstListener);
        worker.addListener("messageerror", secondListener);

        worker.postMessage(badRequest);

        expect(firstListener).toHaveBeenCalledOnce();
        expect(secondListener).toHaveBeenCalledAfter(firstListener);
      });

      it("should not call the error listeners", () => {
        const worker = YellowstoneWorker.create();

        const listener = jest.fn();

        worker.addListener("error", listener);

        worker.postMessage(badRequest);

        expect(listener).not.toHaveBeenCalled();
      });

      it("should not call the message listeners", () => {
        const worker = YellowstoneWorker.create();

        const listener = jest.fn();

        worker.addListener("message", listener);

        worker.postMessage(badRequest);

        expect(listener).not.toHaveBeenCalled();
      });
    });
  });

  describe("adding listeners", () => {
    describe("when adding the same listener thrice", () => {
      it("should be called thrice per message", () => {
        const worker = YellowstoneWorker.create();

        const listener = jest.fn();

        worker.addListener("message", listener);
        worker.addListener("message", listener);
        worker.addListener("message", listener);

        worker.postMessage(goodRequest);

        expect(listener).toHaveBeenCalledTimes(3 * 2);
      });
    });

    describe("when the event type is not supported", () => {
      it("should throw", () => {
        const worker = YellowstoneWorker.create();

        expect(() => {
          worker.addListener("<UNSUPPORTED>" as any, () => {});
        }).toThrow("Unsupported event type: <UNSUPPORTED>");
      });
    });
  });

  describe("removing listeners", () => {
    describe("when the message is serializable", () => {
      it("should call the non-removed message listeners", () => {
        const worker = YellowstoneWorker.create();

        const firstListener = jest.fn();
        const secondListener = jest.fn();

        worker.addListener("message", firstListener);
        worker.addListener("message", secondListener);

        worker.removeListener("message", firstListener);

        worker.postMessage(goodRequest);

        expect(firstListener).not.toHaveBeenCalled();
        expect(secondListener.mock.calls).toEqual([
          [YellowstoneWorker.getFirstResponse(goodRequest)],
          [YellowstoneWorker.secondResponse]
        ]);
      });
    });

    describe("when the message is NOT serializable", () => {
      it("should call the non-removed messageerror listeners", () => {
        const worker = YellowstoneWorker.create();

        const firstListener = jest.fn();
        const secondListener = jest.fn();

        worker.addListener("messageerror", firstListener);
        worker.addListener("messageerror", secondListener);

        worker.removeListener("messageerror", firstListener);

        worker.postMessage(badRequest);

        expect(firstListener).not.toHaveBeenCalled();
        expect(secondListener).toHaveBeenCalledOnce();
      });
    });

    describe("when the event type is not supported", () => {
      it("should throw", () => {
        const worker = YellowstoneWorker.create();

        expect(() => {
          worker.removeListener("<UNSUPPORTED>" as any, () => {});
        }).toThrow("Unsupported event type: <UNSUPPORTED>");
      });
    });

    describe("when removing an unregistered listener", () => {
      it("should just do nothing", () => {
        const worker = YellowstoneWorker.create();

        worker.removeListener("message", () => {});
      });
    });
  });

  describe("when the request listener throws", () => {
    describe("when throwing an error", () => {
      it("should call just the error listeners", () => {
        const worker = WorkerMock.create<TestRequest, TestResponse>(() => {
          throw new Error("Dodo");
        });

        const messageListener = jest.fn();
        const messageErrorListener = jest.fn();
        const errorListener = jest.fn();

        worker.addListener("message", messageListener);
        worker.addListener("messageerror", messageErrorListener);
        worker.addListener("error", errorListener);

        worker.postMessage(goodRequest);

        expect(messageListener).not.toHaveBeenCalled();
        expect(messageErrorListener).not.toHaveBeenCalledOnce();
        expect(errorListener).toHaveBeenCalledWith(new Error("Dodo"));
      });
    });

    describe("when throwing a number", () => {
      it("should call just the error listeners", () => {
        const worker = WorkerMock.create<TestRequest, TestResponse>(() => {
          throw 90;
        });

        const messageListener = jest.fn();
        const messageErrorListener = jest.fn();
        const errorListener = jest.fn();

        worker.addListener("message", messageListener);
        worker.addListener("messageerror", messageErrorListener);
        worker.addListener("error", errorListener);

        worker.postMessage(goodRequest);

        expect(messageListener).not.toHaveBeenCalled();
        expect(messageErrorListener).not.toHaveBeenCalledOnce();
        expect(errorListener).toHaveBeenCalledWith(new Error("90"));
      });
    });
  });

  describe("replying with a non-serializable response", () => {
    it("should call just the messageerror listeners", () => {
      const worker = WorkerMock.create<TestRequest, TestResponse>(
        (request, sendResponse) =>
          sendResponse({
            name: "Dodo",
            age: request.age + 100,
            callback: () => "Functions are not serializable"
          })
      );

      const messageListener = jest.fn();
      const messageErrorListener = jest.fn();
      const errorListener = jest.fn();

      worker.addListener("message", messageListener);
      worker.addListener("messageerror", messageErrorListener);
      worker.addListener("error", errorListener);

      worker.postMessage(goodRequest);

      expect(messageListener).not.toHaveBeenCalled();
      expect(messageErrorListener).toHaveBeenCalledOnce();
      expect(errorListener).not.toHaveBeenCalled();
    });
  });
});
