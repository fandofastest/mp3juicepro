import { MusicProvider } from "./MusicProvider";
import { NormalizedSearchResults, NormalizedTrack, NormalizedAlbum, NormalizedArtist } from "@headless/types";
import ytSearch from "yt-search";

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
    try {
      // Primary: Use InnerTube Scraper (yt-search) - No API Key required, no quota limits
      const searchResult = await ytSearch(query);
      const videos = searchResult?.videos ? searchResult.videos.slice(0, limit) : [];

      if (videos.length > 0) {
        const tracks: NormalizedTrack[] = videos.map((video: any) => ({
          id: video.videoId || Math.random().toString(),
          vid: video.videoId,
          title: video.title || "Unknown Title",
          artist: video.author?.name || "Unknown Artist",
          cover: video.image || video.thumbnail || "",
          duration: video.seconds || 240,
          url: video.url || `https://www.youtube.com/watch?v=${video.videoId}`,
          provider: "youtube",
        }));

        const artists: NormalizedArtist[] = videos
          .map((video: any) => ({
            id: video.author?.name || "unknown_channel",
            name: video.author?.name || "Unknown Artist",
            avatar: video.image || "",
            provider: "youtube",
          }))
          .filter((val: any, idx: any, self: any) => self.findIndex((t: any) => t.id === val.id) === idx);

        // Auto-cache tracks to local database in background
        this.cacheTracksInBackground(tracks);

        return {
          tracks,
          albums: [],
          artists,
        };
      }
    } catch (scraperError) {
      console.warn("yt-search scraper encountered error, falling back to official API if key exists:", scraperError);
    }

    // Fallback: Official YouTube Data API if API Key is available
    if (this.apiKey) {
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

        const tracks: NormalizedTrack[] = items.map((item: any) => {
          const videoId = item.id?.videoId;
          return {
            id: videoId || Math.random().toString(),
            vid: videoId,
            title: item.snippet?.title || "Unknown Title",
            artist: item.snippet?.channelTitle || "Unknown Channel",
            cover: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || "",
            duration: 240,
            url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined,
            provider: "youtube",
          };
        });

        this.cacheTracksInBackground(tracks);

        const artists: NormalizedArtist[] = items
          .map((item: any) => ({
            id: item.snippet?.channelId || "unknown_channel",
            name: item.snippet?.channelTitle || "Unknown Channel",
            avatar: item.snippet?.thumbnails?.high?.url || "",
            provider: "youtube",
          }))
          .filter((value: any, index: any, self: any) => self.findIndex((t: any) => t.id === value.id) === index);

        return {
          tracks,
          albums: [],
          artists,
        };
      } catch (error) {
        console.error("YouTube API search error:", error);
        throw error;
      }
    }

    return { tracks: [], albums: [], artists: [] };
  }

  async getTrack(id: string): Promise<NormalizedTrack | null> {
    try {
      const videoResult: any = await ytSearch({ videoId: id });
      if (videoResult) {
        const trackObj: NormalizedTrack = {
          id: videoResult.videoId,
          vid: videoResult.videoId,
          title: videoResult.title || "Unknown Title",
          artist: videoResult.author?.name || "Unknown Artist",
          cover: videoResult.image || videoResult.thumbnail || "",
          duration: videoResult.seconds || 240,
          url: videoResult.url || `https://www.youtube.com/watch?v=${videoResult.videoId}`,
          provider: "youtube",
        };
        this.cacheTracksInBackground([trackObj]);
        return trackObj;
      }
    } catch (scraperError) {
      console.warn("yt-search getTrack failed, trying official API if key exists:", scraperError);
    }

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

      this.cacheTracksInBackground([trackObj]);
      return trackObj;
    } catch {
      return null;
    }
  }

  async getAlbum(id: string): Promise<NormalizedAlbum | null> {
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

  private cacheTracksInBackground(tracks: NormalizedTrack[]) {
    if (tracks.length === 0) return;
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
}

