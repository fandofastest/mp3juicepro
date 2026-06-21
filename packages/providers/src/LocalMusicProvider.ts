import { MusicProvider } from "./MusicProvider";
import { NormalizedSearchResults, NormalizedTrack } from "@headless/types";
import { Track } from "@headless/database";

export class LocalMusicProvider implements MusicProvider {
  name = "Local Database Provider";

  async search(query: string, limit = 10): Promise<NormalizedSearchResults> {
    try {
      const dbTracks = await Track.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { artist: { $regex: query, $options: "i" } },
        ],
      }).limit(limit);

      const tracks: NormalizedTrack[] = dbTracks.map((t: any) => ({
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
    } catch (error) {
      console.error("Local search error:", error);
      return { tracks: [], albums: [], artists: [] };
    }
  }

  async getTrack(id: string): Promise<NormalizedTrack | null> {
    try {
      const t = await Track.findOne({ vid: id });
      if (!t) return null;
      return {
        id: t.vid,
        vid: t.vid,
        title: t.title,
        artist: t.artist,
        cover: t.cover,
        duration: t.duration,
        provider: t.provider || "local",
      };
    } catch {
      return null;
    }
  }

  async getAlbum(id: string) { return null; }
  async getArtist(id: string) { return null; }
}
