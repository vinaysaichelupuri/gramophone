export interface Song {
  id: string;
  title: string;
  artist: string;
  path: string;
  duration?: number;
  artwork?: string;
  album?: string;
}
