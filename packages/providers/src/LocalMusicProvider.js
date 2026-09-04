"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalMusicProvider = void 0;
const database_1 = require("@headless/database");
class LocalMusicProvider {
    name = "Local Database Provider";
    async search(query, limit = 10) {
        try {
            const dbTracks = await database_1.Track.find({
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { artist: { $regex: query, $options: "i" } },
                ],
            }).limit(limit);
            const tracks = dbTracks.map((t) => ({
                id: t.vid,
                vid: t.vid,
                title: t.title,
                artist: t.artist,
                cover: t.cover,
                duration: t.duration,
                provider: t.provider || "local",
            }));
            return {
                tracks,
                albums: [],
                artists: [],
            };
        }
        catch (error) {
            console.error("Local search error:", error);
            return { tracks: [], albums: [], artists: [] };
        }
    }
    async getTrack(id) {
        try {
            const t = await database_1.Track.findOne({ vid: id });
            if (!t)
                return null;
            return {
                id: t.vid,
                vid: t.vid,
                title: t.title,
                artist: t.artist,
                cover: t.cover,
                duration: t.duration,
                provider: t.provider || "local",
            };
        }
        catch {
            return null;
        }
    }
    async getAlbum(id) { return null; }
    async getArtist(id) { return null; }
}
exports.LocalMusicProvider = LocalMusicProvider;
//# sourceMappingURL=LocalMusicProvider.js.map