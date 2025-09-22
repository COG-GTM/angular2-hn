import React from 'react';

interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: number;
  type: string;
  url: string;
  domain: string;
  comments: any[];
  comments_count: number;
  poll: any[];
  poll_votes_count: number;
  deleted: boolean;
  dead: boolean;
}

interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: string;
  titleFontSize: string;
  listSpacing: string;
}

interface ItemComponentProps {
  item: Story;
  settings: Settings;
}

const formatCommentCount = (count: number): string => {
  if (count > 0) {
    const suffix = count === 1 ? 'comment' : 'comments';
    return `${count} ${suffix}`;
  }
  return 'discuss';
};

export const ItemComponent: React.FC<ItemComponentProps> = ({ item, settings }) => {
  const hasUrl = item.url.indexOf('http') === 0;


  return null;
};
