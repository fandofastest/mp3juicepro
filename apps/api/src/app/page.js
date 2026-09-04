"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const link_1 = __importDefault(require("next/link"));
function Home() {
    return (<div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#191414",
            color: "#ffffff",
            textAlign: "center",
            padding: "20px"
        }}>
      <h1 style={{ color: "#1DB954", fontSize: "3rem", marginBottom: "10px" }}>MP3Juice Pro API Gateway</h1>
      <p style={{ color: "#b3b3b3", fontSize: "1.2rem", maxWidth: "600px", marginBottom: "30px" }}>
        Enterprise headless CMS gateway serving Spotify-like layouts, profiles, home sections, searches, and provider configurations.
      </p>
      <link_1.default href="/docs" style={{
            backgroundColor: "#1DB954",
            color: "#ffffff",
            padding: "12px 30px",
            borderRadius: "30px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            textDecoration: "none",
            transition: "transform 0.2s ease"
        }}>
        View Swagger UI Documentation
      </link_1.default>
    </div>);
}
//# sourceMappingURL=page.js.map