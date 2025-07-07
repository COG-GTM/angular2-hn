export class Comment {
  id: number;
  level: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  deleted: boolean;
  comments: Comment[];

  constructor() {
    this.id = 0;
    this.level = 0;
    this.user = '';
    this.time = 0;
    this.time_ago = '';
    this.content = '';
    this.deleted = false;
    this.comments = [];
  }
}
