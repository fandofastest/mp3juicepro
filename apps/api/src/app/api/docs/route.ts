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
      "/categories": {
        get: {
          summary: "Fetch all active categories for the client application browsing page",
          responses: {
            "200": { description: "List of categories with color codes and slugs" },
          },
        },
      },
      "/categories/tracks": {
        get: {
          summary: "Fetch songs associated with a category by slug or id, falling back to YouTube sync",
          parameters: [
            { name: "slug", in: "query", schema: { type: "string" }, description: "Category slug" },
            { name: "id", in: "query", schema: { type: "string" }, description: "Category unique ID" },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } }
          ],
          responses: {
            "200": { description: "List of tracks and category metadata" },
          },
        },
      },
      "/categories/import-bulk": {
        post: {
          summary: "Trigger bulk YouTube track sync for all active categories",
          responses: {
            "200": { description: "Report of bulk synchronization results" },
          },
        },
      },
      "/genres": {
        get: {
          summary: "Fetch predefined system genres (Pop, Rock, Hip Hop, etc.)",
          responses: {
            "200": { description: "List of system music genres" },
          },
        },
      },
      "/moods": {
        get: {
          summary: "Fetch predefined system moods (Workout, Sleep, Focus, Meditation, etc.)",
          responses: {
            "200": { description: "List of system music moods" },
          },
        },
      },
      "/playlists": {
        get: {
          summary: "Fetch public playlists or owned playlists",
          parameters: [
            { name: "userId", in: "query", schema: { type: "string" }, description: "Optional filter for owner's playlists" }
          ],
          responses: {
            "200": { description: "List of matching playlists" },
          },
        },
      },
      "/history": {
        get: {
          summary: "Fetch authenticated user's listening history list",
          responses: {
            "200": { description: "List of recently played tracks" },
          },
        },
        post: {
          summary: "Log a track play event (increments play count and saves history entry)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    vid: { type: "string", description: "YouTube Video ID (preferred)" },
                    trackId: { type: "string", description: "YouTube Video ID or Track ID" },
                    title: { type: "string" },
                    artist: { type: "string" },
                    album: { type: "string" },
                    cover: { type: "string" },
                    duration: { type: "integer" }
                  },
                  required: []
                }
              }
            }
          },
          responses: {
            "201": { description: "Listening log recorded successfully" },
          },
        },
      },
      "/play": {
        get: {
          summary: "Get track download/playback link and log analytics & history",
          parameters: [
            { name: "vid", in: "query", required: true, schema: { type: "string" }, description: "YouTube Video ID" }
          ],
          responses: {
            "200": { description: "Download link and metadata returned from YouTube MP3 downloader" },
          },
        },
      },
      "/history/most-played": {
        get: {
          summary: "Fetch top most played tracks aggregated across all users",
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } }
          ],
          responses: {
            "200": { description: "Ranked list of top-played tracks" },
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
