import { Story } from './story';

export interface SavedStory {
  id: number;
  title: string;
  url: string;
  by: string;
  score: number;
  savedAt: number;
}

export interface RemovedStory {
  story: SavedStory;
  item?: Story;
}
