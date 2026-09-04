import { MusicProvider } from "./MusicProvider";
import { NormalizedSearchResults, NormalizedTrack } from "@headless/types";
export declare class LocalMusicProvider implements MusicProvider {
    name: string;
    search(query: string, limit?: number): Promise<NormalizedSearchResults>;
    getTrack(id: string): Promise<NormalizedTrack | null>;
    getAlbum(id: string): Promise<null>;
    getArtist(id: string): Promise<null>;
}
//# sourceMappingURL=LocalMusicProvider.d.ts.map