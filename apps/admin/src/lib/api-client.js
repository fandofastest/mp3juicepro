"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRequest = apiRequest;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://juiceproapi.fando.id/api";
async function apiRequest(path, method = "GET", body) {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "An error occurred");
    }
    return result.data;
}
//# sourceMappingURL=api-client.js.map