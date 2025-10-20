import { FeedType } from '../../models/feed-type';

interface FeedProps {
  feedType: FeedType;
}

const Feed = ({ feedType }: FeedProps) => {
  return (
    <div>
      <h1>Feed: {feedType}</h1>
      <p>This component will display the {feedType} feed with pagination.</p>
    </div>
  );
};

export default Feed;
