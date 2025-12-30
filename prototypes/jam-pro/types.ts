
export interface Singer {
  id: string;
  name: string;
  image: string;
  instrument: string;
}

// Added optional image property to Song interface to allow for song-specific background images
export interface Song {
  id: string;
  title: string;
  artist: string;
  singers: Singer[];
  image?: string;
}

export interface KaraokeState {
  currentSong: Song | null;
  nextSong: Song | null;
  history: Song[];
}
