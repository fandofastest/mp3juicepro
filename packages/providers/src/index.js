"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const MockMusicProvider_1 = require("./MockMusicProvider");
const YoutubeMusicProvider_1 = require("./YoutubeMusicProvider");
const LocalMusicProvider_1 = require("./LocalMusicProvider");
__exportStar(require("./MusicProvider.js"), exports);
__exportStar(require("./MockMusicProvider.js"), exports);
__exportStar(require("./YoutubeMusicProvider.js"), exports);
__exportStar(require("./LocalMusicProvider.js"), exports);
class ProviderFactory {
    static providers = {
        mock: new MockMusicProvider_1.MockMusicProvider(),
        youtube: new YoutubeMusicProvider_1.YoutubeMusicProvider(),
        local: new LocalMusicProvider_1.LocalMusicProvider(),
    };
    static registerProvider(name, provider) {
        this.providers[name] = provider;
    }
    static getProvider(name = "mock") {
        const provider = this.providers[name];
        if (!provider) {
            // Fallback
            return this.providers["mock"];
        }
        return provider;
    }
}
exports.ProviderFactory = ProviderFactory;
//# sourceMappingURL=index.js.map