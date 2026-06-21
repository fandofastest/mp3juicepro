import { NormalizedSearchResults, NormalizedTrack, NormalizedAlbum, NormalizedArtist } from "@headless/types";

export interface MusicProvider {
  name: string;
  search(query: string, limit?: number): Promise<NormalizedSearchResults>;
  getTrack(id: string): Promise<NormalizedTrack | null>;
  getAlbum(id: string): Promise<NormalizedAlbum | null>;
  getArtist(id: string): Promise<NormalizedArtist | null>;
}
