import { MusicProvider } from "./MusicProvider";
import { NormalizedSearchResults, NormalizedTrack, NormalizedAlbum, NormalizedArtist } from "@headless/types";
export declare class YoutubeMusicProvider implements MusicProvider {
    name: string;
    private apiKey;
    constructor(apiKey?: string);
    setApiKey(key: string): void;
    search(query: string, limit?: number): Promise<NormalizedSearchResults>;
    getTrack(id: string): Promise<NormalizedTrack | null>;
    getAlbum(id: string): Promise<NormalizedAlbum | null>;
    getArtist(id: string): Promise<NormalizedArtist | null>;
    private cacheTracksInBackground;
}
//# sourceMappingURL=YoutubeMusicProvider.d.ts.map