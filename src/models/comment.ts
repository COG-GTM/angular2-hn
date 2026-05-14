export interface Comment {
  id: number;
  level: number;
  user: string;
  time: number;
  timeAgo: string;
  content: string;
  deleted: boolean;
  comments: Comment[];
}
