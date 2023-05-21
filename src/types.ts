/* eslint-disable @typescript-eslint/no-unused-vars -- WIP */
import type { NextRequest } from "next/server";
import type { ZodIssue, ZodSchema } from "zod";

// ##### Test types for some future ideas #####
type TypeOrNever<TType, TVar extends boolean> = TVar extends true
  ? TType
  : never;

type MiddlewareFunction<TCtx extends Record<string, unknown>> = (
  request: NextRequest,
  ctx: TCtx
) => TCtx & { [key: string]: unknown };

type RequestCtxPreProcessor = (
  request: Request,
  ctx: Record<string, unknown>,
  handler: (
    request: NextRequest,
    ctx: Record<string, unknown>
  ) => Record<string, unknown>
) => Record<string, unknown>;

// ###########################################

export type RequestValidation<TQuery, TBody> = {
  query?: ZodSchema<TQuery>;
  body?: ZodSchema<TBody>;
};

export interface RequestContext<TQuery, TBody> {
  query: TQuery extends never ? never : TQuery;
  body: TBody extends never ? never : TBody;
}

export type ContextHandler<TQuery, TBody> = (
  request: Request,
  ctx: RequestContext<TQuery, TBody>
) => Promise<Response>;

export interface HandlerContextOptions<TQuery, TBody> {
  onError?: (error: any) => Response;
  validation: RequestValidation<TQuery, TBody>;
}

export type RequestValidator<TQuery = unknown> = (
  request: NextRequest,
  schema: ZodSchema<TQuery>
) =>
  | { data: TQuery; errors: undefined }
  | { data: undefined; errors: ErrorListItem };

export type ErrorListItem = {
  type: "Query" | "Body";
  errors: ZodIssue[] | undefined;
};

export type ValidateRequestReturn<TQuery, TBody> =
  | { success: false; errors: ErrorListItem[] }
  | {
      success: true;
      data: {
        query: TQuery extends null ? never : TQuery;
        body: TBody extends null ? never : TBody;
      };
    };
