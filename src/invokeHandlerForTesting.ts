import { Context, Handler } from 'aws-lambda';

/**
 * strip down event, like normal request would
 *
 * (e.g., remove any "Class" or non stringifiable data on the event. Only things representable as JSON are sent over the wire, so replicate that)
 */
const stripInvocationEvent = (event: any) => JSON.parse(JSON.stringify(event));

/**
 * to make it easy to invoke your handlers, swapping callback syntax to promise syntax as needed
 */
export const invokeHandlerForTesting = async <E, R extends any>({
  event,
  context = {},
  handler,
}: {
  event: E;
  context?: Record<string, any>;
  handler: Handler;
}): Promise<R> =>
  new Promise((resolve, reject) => {
    const response = handler(
      stripInvocationEvent(event),
      context as Context, // cast "as Context", since Context could have more keys than the ones defined here. also, if there is less, for usage to invoke handler functions there is no con
      (error: any, result: R) => {
        if (error) return reject(error);
        return resolve(result); // resolve result from callback
      },
    );
    if (response instanceof Promise) resolve(response); // if it was an async function and returned something, resolve that; otherwise, the callback will get triggered
  });
