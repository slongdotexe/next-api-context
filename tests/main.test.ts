/* eslint-disable no-unused-expressions -- false alarm */

import { expect } from "chai";
import { describe, it } from "mocha";
import { NextResponse } from "next/server";
import sinon from "sinon";
import { z } from "zod";

import { createRequest, getDefaultHandler } from "./util";

import { withRequestContext } from "@/index";

describe("API context `query` and `body` validation", () => {
  const uri = "https://testdomain.com";
  const goodData = { some: "data" };
  const badData = { someOther: "data" };
  const validation = z.object({
    some: z.string(),
  });

  describe("when calling with valid data", async () => {
    it("Should execute handler if `body` is valid", async () => {
      const handlerFn = sinon.spy(getDefaultHandler());
      const handler = withRequestContext(
        {
          validation: {
            body: validation,
          },
        },
        handlerFn
      );
      await handler(createRequest(uri, "POST", goodData));
      expect(handlerFn.calledOnce).to.be.true;
    });

    it("Should return a `NextApiResponse` with status 200 if `body` is valid", async () => {
      const handler = withRequestContext(
        {
          validation: {
            body: validation,
          },
        },
        getDefaultHandler()
      );
      const res = await handler(createRequest(uri, "POST", goodData));
      expect(res).to.be.instanceOf(NextResponse);
      expect(res.status).to.equal(200);
    });

    it("Should execute handler if `query` is valid", async () => {
      const handlerFn = sinon.spy(getDefaultHandler());
      const handler = withRequestContext(
        {
          validation: {
            query: validation,
          },
        },
        handlerFn
      );
      await handler(createRequest(uri, "POST", {}, goodData));
      expect(handlerFn.calledOnce).to.be.true;
    });

    it("Should return a `NextApiResponse` with status 200 if `query` is valid", async () => {
      const handler = withRequestContext(
        {
          validation: {
            query: validation,
          },
        },
        getDefaultHandler()
      );
      const res = await handler(createRequest(uri, "POST", {}, goodData));
      expect(res).to.be.instanceOf(NextResponse);
      expect(res.status).to.equal(200);
    });

    it("should attach validated data to `body` field in ctx", async () => {
      const handlerFn = sinon.spy(getDefaultHandler());
      const handler = withRequestContext(
        {
          validation: {
            body: validation,
          },
        },
        handlerFn
      );
      await handler(createRequest(uri, "POST", goodData));
      const [, ctx] = handlerFn.args[0];
      expect(ctx.body).to.deep.equal(goodData);
    });

    it("should attach validated data to `query` field in ctx", async () => {
      const handlerFn = sinon.spy(getDefaultHandler());
      const handler = withRequestContext(
        {
          validation: {
            query: validation,
          },
        },
        handlerFn
      );
      await handler(createRequest(uri, "POST", {}, goodData));
      const [, ctx] = handlerFn.args[0];
      expect(ctx.query).to.deep.equal(goodData);
    });
  });

  describe("when calling with invalid data", async () => {
    it("Should return a `NextApiResponse` with status 400 if body is invalid", async () => {
      const handler = withRequestContext(
        {
          validation: {
            body: validation,
          },
        },
        getDefaultHandler()
      );
      const res = await handler(createRequest(uri, "POST", badData));
      expect(res).to.be.instanceOf(NextResponse);
      expect(res.status).to.equal(400);
    });

    it("Should return a `NextApiResponse` with status 400 if query is invalid", async () => {
      const handler = withRequestContext(
        {
          validation: {
            query: validation,
          },
        },
        getDefaultHandler()
      );
      const res = await handler(createRequest(uri, "POST", {}, badData));
      expect(res).to.be.instanceOf(NextResponse);
      expect(res.status).to.equal(400);
    });
  });
});
