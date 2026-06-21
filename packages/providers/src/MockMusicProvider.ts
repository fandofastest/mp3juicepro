import { MusicProvider } from "./MusicProvider";
import { NormalizedSearchResults, NormalizedTrack, NormalizedAlbum, NormalizedArtist } from "@headless/types";

export class MockMusicProvider implements MusicProvider {
  name = "Mock Provider";

  private mockTracks: NormalizedTrack[] = [
    {
      id: "track_1",
      title: "Blinding Lights",
      artist: "The Weeknd",
      artistId: "artist_1",
      album: "After Hours",
      albumId: "album_1",
      cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60",
      duration: 200,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      provider: "mock",
    },
    {
      id: "track_2",
      title: "Starboy",
      artist: "The Weeknd",
      artistId: "artist_1",
      album: "Starboy",
      albumId: "album_2",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60",
      duration: 230,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      provider: "mock",
    },
    {
      id: "track_3",
      title: "Shape of You",
      artist: "Ed Sheeran",
      artistId: "artist_2",
      album: "Divide",
      albumId: "album_3",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60",
      duration: 233,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      provider: "mock",
    },
    {
      id: "track_4",
      title: "Perfect",
      artist: "Ed Sheeran",
      artistId: "artist_2",
      album: "Divide",
      albumId: "album_3",
      cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=60",
      duration: 263,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      provider: "mock",
    },
    {
      id: "track_5",
      title: "Lofi Study Session",
      artist: "Lofi Chill Beats",
      artistId: "artist_3",
      album: "Focus & Chill",
      albumId: "album_4",
      cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60",
      duration: 180,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      provider: "mock",
    },
    {
      id: "track_6",
      title: "Midnight Drive",
      artist: "Synthwave Horizon",
      artistId: "artist_4",
      album: "Neon City Nights",
      albumId: "album_5",
      cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60",
      duration: 215,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      provider: "mock",
    },
    {
      id: "track_7",
      title: "Summer Vibes",
      artist: "Tropical Paradise",
      artistId: "artist_5",
      album: "Island Sunset",
      albumId: "album_6",
      cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&auto=format&fit=crop&q=60",
      duration: 195,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      provider: "mock",
    },
  ];

  private mockArtists: NormalizedArtist[] = [
    {
      id: "artist_1",
      name: "The Weeknd",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=60",
      genres: ["R&B", "Pop"],
      provider: "mock",
    },
    {
      id: "artist_2",
      name: "Ed Sheeran",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=60",
      genres: ["Pop", "Acoustic"],
      provider: "mock",
    },
    {
      id: "artist_3",
      name: "Lofi Chill Beats",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=60",
      genres: ["Lofi", "Instrumental"],
      provider: "mock",
    },
    {
      id: "artist_4",
      name: "Synthwave Horizon",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=60",
      genres: ["EDM", "Rock"],
      provider: "mock",
    },
  ];

  private mockAlbums: NormalizedAlbum[] = [
    {
      id: "album_1",
      title: "After Hours",
      artist: "The Weeknd",
      artistId: "artist_1",
      cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60",
      releaseDate: "2020-03-20",
      provider: "mock",
    },
    {
      id: "album_2",
      title: "Starboy",
      artist: "The Weeknd",
      artistId: "artist_1",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60",
      releaseDate: "2016-11-25",
      provider: "mock",
    },
    {
      id: "album_3",
      title: "Divide",
      artist: "Ed Sheeran",
      artistId: "artist_2",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60",
      releaseDate: "2017-03-03",
      provider: "mock",
    },
  ];

  async search(query: string, limit = 10): Promise<NormalizedSearchResults> {
    const term = query.toLowerCase().trim();
    if (!term) {
      return {
        tracks: this.mockTracks.slice(0, limit),
        albums: this.mockAlbums.slice(0, limit),
        artists: this.mockArtists.slice(0, limit),
      };
    }

    const filteredTracks = this.mockTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.artist.toLowerCase().includes(term) ||
        (t.album && t.album.toLowerCase().includes(term))
    );

    const filteredArtists = this.mockArtists.filter((a) => a.name.toLowerCase().includes(term));

    const filteredAlbums = this.mockAlbums.filter(
      (a) => a.title.toLowerCase().includes(term) || a.artist.toLowerCase().includes(term)
    );

    return {
      tracks: filteredTracks.slice(0, limit),
      albums: filteredAlbums.slice(0, limit),
      artists: filteredArtists.slice(0, limit),
    };
  }

  async getTrack(id: string): Promise<NormalizedTrack | null> {
    return this.mockTracks.find((t) => t.id === id) || null;
  }

  async getAlbum(id: string): Promise<NormalizedAlbum | null> {
    const album = this.mockAlbums.find((a) => a.id === id);
    if (!album) return null;

    // Attach album tracks
    const tracks = this.mockTracks.filter((t) => t.albumId === id);
    return { ...album, tracks };
  }

  async getArtist(id: string): Promise<NormalizedArtist | null> {
    return this.mockArtists.find((a) => a.id === id) || null;
  }
}
