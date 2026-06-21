import { MusicProvider } from "./MusicProvider";
import { MockMusicProvider } from "./MockMusicProvider";

export * from "./MusicProvider.js";
export * from "./MockMusicProvider.js";

export class ProviderFactory {
  private static providers: Record<string, MusicProvider> = {
    mock: new MockMusicProvider(),
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
