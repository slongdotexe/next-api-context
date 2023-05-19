import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

import {
  ContextHandler,
  ErrorListItem,
  HandlerContextOptions,
  RequestContext,
  ValidateRequestReturn,
} from "./types";

const defaultOnError = (error: any) =>
  NextResponse.json(
    {
      error: error?.message || "An unexpected error occurred",
    },
    { status: 500 }
  );

export const validateRequest = <
  TQuery extends ZodSchema<any> | null,
  TBody extends ZodSchema<any> | null
>(
  request: NextRequest,
  querySchema: TQuery | null,
  bodySchema: TBody | null
): ValidateRequestReturn<TQuery, TBody> => {
  const errors: ErrorListItem[] = [];
  const result: { query: any; body: any } = {
    query: {},
    body: {},
  };
  const parsedQuery = querySchema?.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  const parsedBody = bodySchema?.safeParse(request.body);
  if (parsedQuery?.success === false) {
    errors.push({ type: "Query", errors: parsedQuery?.error.errors });
  } else {
    result.query = parsedQuery?.data;
  }
  if (parsedBody?.success === false) {
    errors.push({ type: "Body", errors: parsedBody?.error.errors });
  } else {
    result.body = parsedBody?.data;
  }
  if (errors.length > 0) {
    return { errors, success: false };
  }
  return { success: true, data: result };
};

export const withRequestContext: <TQuery = never, TBody = never>(
  options: HandlerContextOptions<TQuery, TBody>,
  handler: ContextHandler<TQuery, TBody>
) => ContextHandler<TQuery, TBody> =
  ({ validation: { query = null, body = null } }, handler) =>
  async (request) => {
    const req = new NextRequest(request);
    const validatedFields = validateRequest<typeof query, typeof body>(
      req,
      query,
      body
    );
    if (!validatedFields.success) {
      return NextResponse.json(validatedFields.errors, { status: 400 });
    }
    const ctx2: RequestContext<any, any> = {
      ...validatedFields.data,
    };
    return handler(req, ctx2).catch(defaultOnError);
  };
