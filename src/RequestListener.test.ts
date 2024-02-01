import { join } from "node:path";
import { Worker } from "node:worker_threads";

describe("Request listener", () => {
  describe("when registering within a worker thread", () => {
    it("should work", () =>
      new Promise<void>((resolve, reject) => {
        const expectedResponses = [90, 92, 95, 98];

        const worker = new Worker(join(__dirname, "test", "worker-thread.ts"), {
          execArgv: ["--require", "@swc-node/register"]
        });
        worker.on("message", response => {
          const expectedResponse = expectedResponses.shift();
          if (expectedResponse === undefined) {
            return resolve();
          }

          expect(response).toBe(expectedResponse);
        });
        worker.on("error", reject);
        worker.on("exit", code => {
          if (!code) {
            resolve();
          } else {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });

        worker.postMessage(0);
        worker.postMessage(2);
        worker.postMessage(5);
        worker.postMessage(8);
        worker.postMessage(-1);
      }));
  });
});
