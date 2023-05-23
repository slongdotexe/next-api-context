/* eslint-disable @typescript-eslint/no-unused-vars --  I am the captain */
import { NextRequest, NextResponse } from "next/server";

export const createRequest = (
  url: string,
  method: string,
  body = {},
  query = {}
) => {
  const uri = `${url}?${new URLSearchParams(query).toString()}`;

  return new NextRequest(
    uri,
    new Request(uri, {
      method,
      body: JSON.stringify(body),
    })
  );
};

export const getDefaultRes = () => NextResponse.json({});

// @ts-ignore
export const getDefaultHandler = () => async (req, ctx) => getDefaultRes();
