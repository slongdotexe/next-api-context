import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

import {
  ContextHandler,
  ErrorListItem,
  HandlerContextOptions,
  RequestContext,
  ValidateRequestReturn,
} from "./types";

/**
 * Default error handler if none is provided
 * @param error Error object
 * @returns NextResponse with status 500 and error message
 */
const defaultOnError = (error: any) =>
  NextResponse.json(
    {
      error: error?.message || "An unexpected error occurred",
    },
    { status: 500 }
  );

/**
 * Validates request query and body
 * @param request NextRequest object
 * @param querySchema ZodSchema for query validation
 * @param bodySchema ZodSchema for body validation
 * @returns Object with success flag and data or errors
 */
const validateRequest = async <
  TQuery extends ZodSchema<any> | null,
  TBody extends ZodSchema<any> | null
>(
  request: Request,
  querySchema: TQuery | null,
  bodySchema: TBody | null
): Promise<ValidateRequestReturn<TQuery, TBody>> => {
  const errors: ErrorListItem[] = [];
  const result: { query: any; body: any } = {
    query: {},
    body: {},
  };

  const parsedQuery = querySchema?.safeParse(
    // URLSearchParams does not inherit from Object and therefore does not have the expected prototype and will break Zod
    Object.fromEntries(new URL(request.url).searchParams)
  );
  const parsedBody = bodySchema?.safeParse(await request.json());
  // Validate body, push errors if they exist
  if (parsedBody?.success === false) {
    errors.push({ type: "Body", errors: parsedBody?.error.errors });
  } else {
    result.body = parsedBody?.data;
  }
  // Validate query, push errors if they exist
  if (parsedQuery?.success === false) {
    errors.push({ type: "Query", errors: parsedQuery?.error.errors });
  } else {
    result.query = parsedQuery?.data;
  }
  // If there are errors, return them
  if (errors.length > 0) {
    return { errors, success: false };
  }
  return { success: true, data: result };
};

/**
 * Creates a handler that validates request query and body and passes them to the handler
 * If validation fails on any field, returns a NextResponse with status `400` and the errors
 * Otherwise, returns the result of the handler
 * @param options HandlerContextOptions
 * @param handler ContextHandler
 * @returns Next 13.2+ compatible handler
 * @example
 *  
 * ```ts
 *     
export const POST = withRequestContext(
  {
    validation: {
      query: z.object({
        hello: z.string(),
      }),
      body: z.object({
        holla: z.string(),
      }),
    },
  },
  async (req, ctx) => {
    return NextResponse.json({ hello: "world" });
  }
);
 * ```
 */
export const withRequestContext: <TQuery = never, TBody = never>(
  options: HandlerContextOptions<TQuery, TBody>,
  handler: ContextHandler<TQuery, TBody>
) => (request: NextRequest) => Promise<Response> =
  ({ validation: { query = null, body = null } }, handler) =>
  async (request) => {
    // Clone request to avoid mutating the original
    const req = request.clone();
    const validatedFields = await validateRequest(req, query, body);
    if (!validatedFields.success) {
      return NextResponse.json(validatedFields.errors, { status: 400 });
    }
    const ctx: RequestContext<any, any> = validatedFields.data;
    return handler(req, ctx).catch(defaultOnError);
  };
