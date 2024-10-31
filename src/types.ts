export interface Channel {
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

export interface PlaylistState {
  url: string;
  channels: Channel[];
}