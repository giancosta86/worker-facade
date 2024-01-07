export type ResponseSender<TResponse> = (
  response: TResponse,
  ...options: readonly any[]
) => void;

export type RequestListener<TRequest, TResponse> = (
  request: TRequest,
  sendResponse: ResponseSender<TResponse>
) => void;

export namespace RequestListener {
  export function register<TRequest, TResponse>(
    globalSelf: Window & typeof globalThis,
    listener: RequestListener<TRequest, TResponse>
  ): void {
    globalSelf.addEventListener("message", event => {
      const request = event.data as TRequest;
      listener(request, globalSelf.postMessage);
    });
  }
}
