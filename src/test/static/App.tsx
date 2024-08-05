import React, { useEffect } from "react";
import { WebWorker } from "../../WebWorker";

export function App() {
  useEffect(() => {
    console.log("----> CAN I CREATE THE WEB WORKER? WINDOW IS", window);
    const webWorker = WebWorker.create(
      window,
      new URL("math.worker.ts", import.meta.url),
      {
        type: "module"
      }
    );
    if (webWorker) {
      console.log("----> WEB WORKER CREATED!", webWorker);
    }

    //const webWorker = WebWorker.wrap(worker);

    webWorker.addListener("message", response => {
      alert(`Your number is: ${response}`);
    });

    webWorker.postMessage(8);
  }, []);

  return <h1>Worker tests</h1>;
}
