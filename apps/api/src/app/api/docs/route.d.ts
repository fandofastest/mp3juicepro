import { NextResponse } from "next/server";
export declare function GET(): Promise<NextResponse<{
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers: {
        url: string;
        description: string;
    }[];
    paths: {
        "/auth/register": {
            post: {
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    username: {
                                        type: string;
                                    };
                                    displayName: {
                                        type: string;
                                    };
                                    email: {
                                        type: string;
                                    };
                                    password: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                responses: {
                    "201": {
                        description: string;
                    };
                };
            };
        };
        "/auth/login": {
            post: {
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    email: {
                                        type: string;
                                    };
                                    password: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/search": {
            get: {
                summary: string;
                parameters: ({
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        default?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                    required?: undefined;
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: string;
                    };
                    required?: undefined;
                })[];
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/home": {
            get: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/dashboard": {
            get: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/categories": {
            get: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/categories/tracks": {
            get: {
                summary: string;
                parameters: ({
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default?: undefined;
                    };
                    description: string;
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                    description?: undefined;
                })[];
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/categories/import-bulk": {
            post: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/genres": {
            get: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/moods": {
            get: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/playlists": {
            get: {
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                    };
                    description: string;
                }[];
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/history": {
            get: {
                summary: string;
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
            post: {
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    vid: {
                                        type: string;
                                        description: string;
                                    };
                                    trackId: {
                                        type: string;
                                        description: string;
                                    };
                                    title: {
                                        type: string;
                                    };
                                    artist: {
                                        type: string;
                                    };
                                    album: {
                                        type: string;
                                    };
                                    cover: {
                                        type: string;
                                    };
                                    duration: {
                                        type: string;
                                    };
                                };
                                required: never[];
                            };
                        };
                    };
                };
                responses: {
                    "201": {
                        description: string;
                    };
                };
            };
        };
        "/play": {
            get: {
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                    description: string;
                }[];
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
        "/history/most-played": {
            get: {
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                }[];
                responses: {
                    "200": {
                        description: string;
                    };
                };
            };
        };
    };
}>>;
//# sourceMappingURL=route.d.ts.map