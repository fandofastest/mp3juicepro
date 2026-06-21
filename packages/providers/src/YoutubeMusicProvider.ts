import { MusicProvider } from "./MusicProvider";
import { NormalizedSearchResults, NormalizedTrack, NormalizedAlbum, NormalizedArtist } from "@headless/types";

export class YoutubeMusicProvider implements MusicProvider {
  name = "YouTube Provider";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YOUTUBE_API_KEY || "";
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async search(query: string, limit = 10): Promise<NormalizedSearchResults> {
    if (!this.apiKey) {
      console.warn("YouTube API Key is missing. Falling back to empty results.");
      return { tracks: [], albums: [], artists: [] };
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${limit}&q=${encodeURIComponent(
          query
        )}&type=video&key=${this.apiKey}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "YouTube API search failed");
      }

      const data = await response.json();
      const items = data.items || [];

      // Map YouTube search results to NormalizedTrack models
      const tracks: NormalizedTrack[] = items.map((item: any) => {
        const videoId = item.id?.videoId;
        return {
          id: videoId || Math.random().toString(),
          vid: videoId,
          title: item.snippet?.title || "Unknown Title",
          artist: item.snippet?.channelTitle || "Unknown Channel",
          cover: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || "",
          duration: 240, // Estimated duration (4 minutes)
          url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined,
          provider: "youtube",
        };
      });

      // Auto-cache tracks to local database in background
      if (tracks.length > 0) {
        import("@headless/database").then(({ Track }) => {
          Promise.all(
            tracks.map(t => {
              if (!t.vid) return Promise.resolve();
              return Track.findOneAndUpdate(
                { vid: t.vid },
                {
                  vid: t.vid,
                  title: t.title,
                  artist: t.artist,
                  cover: t.cover,
                  duration: t.duration,
                  provider: "youtube",
                },
                { upsert: true }
              );
            })
          ).catch(err => console.error("Auto-caching tracks failed:", err));
        }).catch(err => console.error("Failed to load Track model for caching:", err));
      }

      // YouTube does not cleanly segment albums/artists from a single search query,
      // so we map related channels as artists, and stub albums for model completeness
      const artists: NormalizedArtist[] = items.map((item: any) => ({
        id: item.snippet?.channelId || "unknown_channel",
        name: item.snippet?.channelTitle || "Unknown Channel",
        avatar: item.snippet?.thumbnails?.high?.url || "",
        provider: "youtube",
      })).filter((value: any, index: any, self: any) => 
        self.findIndex((t: any) => t.id === value.id) === index
      );

      return {
        tracks,
        albums: [],
        artists,
      };
    } catch (error) {
      console.error("YouTube search error:", error);
      throw error;
    }
  }

  async getTrack(id: string): Promise<NormalizedTrack | null> {
    if (!this.apiKey) return null;
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${this.apiKey}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      const item = data.items?.[0];
      if (!item) return null;

      const trackObj = {
        id: item.id,
        vid: item.id,
        title: item.snippet?.title || "Unknown Title",
        artist: item.snippet?.channelTitle || "Unknown Channel",
        cover: item.snippet?.thumbnails?.high?.url || "",
        duration: 240,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        provider: "youtube",
      };

      // Auto-cache single track
      import("@headless/database").then(({ Track }) => {
        Track.findOneAndUpdate(
          { vid: trackObj.vid },
          {
            vid: trackObj.vid,
            title: trackObj.title,
            artist: trackObj.artist,
            cover: trackObj.cover,
            duration: trackObj.duration,
            provider: "youtube",
          },
          { upsert: true }
        ).catch(err => console.error("Auto-caching single track failed:", err));
      }).catch(err => console.error("Failed to load Track model for single cache:", err));

      return trackObj;
    } catch {
      return null;
    }
  }

  async getAlbum(id: string): Promise<NormalizedAlbum | null> {
    // Stub
    return null;
  }

  async getArtist(id: string): Promise<NormalizedArtist | null> {
    if (!this.apiKey) return null;
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${id}&key=${this.apiKey}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      const item = data.items?.[0];
      if (!item) return null;

      return {
        id: item.id,
        name: item.snippet?.title || "Unknown Artist",
        avatar: item.snippet?.thumbnails?.high?.url || "",
        provider: "youtube",
      };
    } catch {
      return null;
    }
  }
}
