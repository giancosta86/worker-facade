import { RequestListener } from "../../RequestListener";

console.log("-----> ENTERING WORKER SCRIPT");
RequestListener.register<number, number>(self, (request, sendResponse) => {
  const response = request + 101;
  console.log("----> RECEIVED:", request, "SENDING BACK:", response);
  sendResponse(response);
});
