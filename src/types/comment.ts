export interface Comment {
  id: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  comments: Comment[];
  level: number;
  deleted?: boolean;
  dead?: boolean;
}
