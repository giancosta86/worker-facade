import { join } from "node:path";
import { Worker } from "node:worker_threads";
import { WorkerFacade } from "./WorkerFacade";

describe("Request listener", () => {
  describe("when registering within a worker thread", () => {
    it("should work", () =>
      new Promise<void>((resolve, reject) => {
        const expectedResponses = [90, 92, 95, 98];

        const worker = new Worker(join(__dirname, "test", "worker-thread.ts"), {
          execArgv: ["--require", "@swc-node/register"]
        }).on("exit", exitCode => {
          if (!exitCode) {
            resolve();
          } else {
            reject(
              new Error(`Worker thread stopped with exit code ${exitCode}`)
            );
          }
        });

        const workerFacade: WorkerFacade<number, number> = worker;

        workerFacade.addListener("message", response => {
          const expectedResponse = expectedResponses.shift();
          expect(response).toBe(expectedResponse);
        });

        workerFacade.addListener("error", reject);

        workerFacade.postMessage(0);
        workerFacade.postMessage(2);
        workerFacade.postMessage(5);
        workerFacade.postMessage(8);
        workerFacade.postMessage(-1);
      }));
  });
});
