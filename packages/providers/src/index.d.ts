import { MusicProvider } from "./MusicProvider";
export * from "./MusicProvider.js";
export * from "./MockMusicProvider.js";
export * from "./YoutubeMusicProvider.js";
export * from "./LocalMusicProvider.js";
export declare class ProviderFactory {
    private static providers;
    static registerProvider(name: string, provider: MusicProvider): void;
    static getProvider(name?: string): MusicProvider;
}
//# sourceMappingURL=index.d.ts.map