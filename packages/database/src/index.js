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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.disconnectFromDatabase = disconnectFromDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("@headless/utils");
__exportStar(require("./schemas.js"), exports);
__exportStar(require("./seed.js"), exports);
let isConnected = false;
async function connectToDatabase(uri) {
    if (isConnected) {
        return;
    }
    const mongoUri = uri || process.env.MONGODB_URI || "mongodb://localhost:27017/mp3juice";
    try {
        const db = await mongoose_1.default.connect(mongoUri, {
            autoIndex: true,
        });
        isConnected = db.connections[0].readyState === 1;
        utils_1.Logger.info("Database connected successfully.");
    }
    catch (error) {
        utils_1.Logger.error("Failed to connect to database:", error);
        throw error;
    }
}
async function disconnectFromDatabase() {
    if (!isConnected)
        return;
    try {
        await mongoose_1.default.disconnect();
        isConnected = false;
        utils_1.Logger.info("Database disconnected successfully.");
    }
    catch (error) {
        utils_1.Logger.error("Error disconnecting from database:", error);
    }
}
//# sourceMappingURL=index.js.map