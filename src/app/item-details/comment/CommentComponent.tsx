import React, { useState, useEffect } from 'react';

interface Comment {
  id: number;
  level: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  deleted: boolean;
  comments: Comment[];
}

interface CommentComponentProps {
  comment: Comment;
}

export const CommentComponent: React.FC<CommentComponentProps> = ({ comment }) => {
  const [collapse, setCollapse] = useState<boolean>(false);

  useEffect(() => {
    setCollapse(false);
  }, []);

  return null;
};
