import { MusicProvider } from "./MusicProvider";
import { NormalizedSearchResults, NormalizedTrack, NormalizedAlbum, NormalizedArtist } from "@headless/types";
export declare class MockMusicProvider implements MusicProvider {
    name: string;
    private mockTracks;
    private mockArtists;
    private mockAlbums;
    search(query: string, limit?: number): Promise<NormalizedSearchResults>;
    getTrack(id: string): Promise<NormalizedTrack | null>;
    getAlbum(id: string): Promise<NormalizedAlbum | null>;
    getArtist(id: string): Promise<NormalizedArtist | null>;
}
//# sourceMappingURL=MockMusicProvider.d.ts.map