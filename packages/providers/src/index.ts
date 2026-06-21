import { MusicProvider } from "./MusicProvider";
import { MockMusicProvider } from "./MockMusicProvider";
import { YoutubeMusicProvider } from "./YoutubeMusicProvider";
import { LocalMusicProvider } from "./LocalMusicProvider";

export * from "./MusicProvider.js";
export * from "./MockMusicProvider.js";
export * from "./YoutubeMusicProvider.js";
export * from "./LocalMusicProvider.js";

export class ProviderFactory {
  private static providers: Record<string, MusicProvider> = {
    mock: new MockMusicProvider(),
    youtube: new YoutubeMusicProvider(),
    local: new LocalMusicProvider(),
  };

  static registerProvider(name: string, provider: MusicProvider) {
    this.providers[name] = provider;
  }

  static getProvider(name = "mock"): MusicProvider {
    const provider = this.providers[name];
    if (!provider) {
      // Fallback
      return this.providers["mock"];
    }
    return provider;
  }
}
