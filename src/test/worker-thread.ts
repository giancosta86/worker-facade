import { exit } from "node:process";

import { RequestListener } from "../RequestListener";

RequestListener.register<number, number>(
  global["self"],
  (request, sendResponse) => {
    if (request < 0) {
      return exit(0);
    }
    const response = request + 90;

    sendResponse(response);
  }
);
