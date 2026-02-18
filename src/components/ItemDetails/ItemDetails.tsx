import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Comment } from '../Comment';
import type { CommentData } from '../Comment';
import './ItemDetails.css';

interface PollResult {
  points: number;
  content: string;
}

interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: string;
  type: string;
  url: string;
  domain: string;
  content: string;
  comments: CommentData[];
  comments_count: number;
  poll: PollResult[];
  poll_votes_count: number;
  deleted: boolean;
  dead: boolean;
}

const BASE_URL = 'https://node-hnapi.herokuapp.com';

function formatCommentCount(count: number): string {
  if (count > 0) {
    return count === 1 ? '1 comment' : `${count} comments`;
  }
  return 'discuss';
}

async function fetchItemContent(id: number): Promise<Story> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  const story: Story = await response.json();

  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    let pollVotesCount = 0;
    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) =>
        fetch(`${BASE_URL}/item/${story.id + i + 1}`).then((res) => res.json())
      )
    );
    pollResults.forEach((result, i) => {
      story.poll[i] = result;
      pollVotesCount += result.points;
    });
    story.poll_votes_count = pollVotesCount;
  }

  return story;
}

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchItemContent(Number(id))
        .then((data) => setItem(data))
        .catch(() => setErrorMessage('Could not load item comments.'));
    }
  }, [id]);

  const hasUrl = item ? item.url && item.url.indexOf('http') === 0 : false;

  if (!item && !errorMessage) {
    return (
      <div className="main-content">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!item && errorMessage) {
    return (
      <div className="main-content">
        <div className="error-message">{errorMessage}</div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="main-content">
      <div className="item">
        {/* Mobile header */}
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={() => navigate(-1)} />
            {hasUrl ? (
              <a className="title" href={item.url}>
                {item.title}
              </a>
            ) : (
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            )}
          </p>
        </div>

        {/* Desktop/laptop header */}
        <div
          className={`laptop${
            item.comments_count > 0 || item.type === 'job'
              ? ' item-header'
              : ''
          }${item.content ? ' head-margin' : ''}`}
        >
          {hasUrl ? (
            <p>
              <a className="title" href={item.url}>
                {item.title}
              </a>
              {item.domain && (
                <span className="domain">({item.domain})</span>
              )}
            </p>
          ) : (
            <p>
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            </p>
          )}
          <div className="subtext">
            {item.type !== 'job' && (
              <span>
                {item.points} points by{' '}
                <Link to={`/user/${item.user}`}>{item.user}</Link>
              </span>
            )}
            <span className={item.type !== 'job' ? 'item-details' : ''}>
              {item.time_ago}
              {item.type !== 'job' && (
                <span>
                  {' '}
                  |{' '}
                  <Link to={`/item/${item.id}`}>
                    {formatCommentCount(item.comments_count)}
                  </Link>
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Poll results */}
        {item.type === 'poll' && item.poll && (
          <div className="poll-results">
            {item.poll.map((pollResult, index) => (
              <div key={index} className="poll-content">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="poll-bar"
                  style={{
                    width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Item content */}
        {item.content && (
          <p
            className="subject"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}

        {/* Comments */}
        <ul className="comment-list">
          {item.comments &&
            item.comments.map((comment) => (
              <li key={comment.id}>
                <Comment comment={comment} />
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ItemDetails;
