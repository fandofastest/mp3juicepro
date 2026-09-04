"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
exports.metadata = {
    title: "Headless Music API Server",
    description: "REST API Platform Gateway",
};
function RootLayout({ children }) {
    return (<html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map