import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Headless Music Platform CMS API",
      version: "1.0.0",
      description: "Production-ready enterprise API endpoints for Flutter, Web, and Smart TV clients.",
    },
    servers: [
      {
        url: "/api",
        description: "Local Dev Server",
      },
    ],
    paths: {
      "/auth/register": {
        post: {
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string" },
                    displayName: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                  required: ["username", "displayName", "email", "password"],
                },
              },
            },
          },
          responses: {
            "201": { description: "User registered successfully" },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "Log in with email & password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            "200": { description: "Authentication tokens signed" },
          },
        },
      },
      "/search": {
        get: {
          summary: "Search tracks, artists, and albums",
          parameters: [
            { name: "q", in: "query", required: true, schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "provider", in: "query", schema: { type: "string", default: "mock" } },
          ],
          responses: {
            "200": { description: "Normalized search results" },
          },
        },
      },
      "/home": {
        get: {
          summary: "Fetch dynamic homepage configurations & populated sections",
          responses: {
            "200": { description: "Homepage layouts and playlists parsed" },
          },
        },
      },
      "/dashboard": {
        get: {
          summary: "Fetch administrator metrics (Super Admin / Admin / Moderator only)",
          responses: {
            "200": { description: "Aggregated counters & charting data" },
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
