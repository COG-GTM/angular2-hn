// Ported from src/app/item-details/item-details.component.{ts,html}
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchItemContent } from '../../api/hn';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import type { Story } from '../../types';
import { CommentTree } from './CommentTree';
import { ItemHeader } from './ItemHeader';
import './ItemDetailsPage.scss';

const ERROR_MESSAGE = 'Could not load item comments.';

function pollBarWidth(points: number, total: number | undefined): string {
  return `${total ? (points / total) * 100 : 0}%`;
}

export default function ItemDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setItem(null);
    setErrorMessage('');
    fetchItemContent(Number(id), controller.signal)
      .then(setItem)
      .catch((err: unknown) => {
        if (controller.signal.aborted || (err as Error)?.name === 'AbortError') return;
        setErrorMessage(ERROR_MESSAGE);
      });
    return () => controller.abort();
  }, [id]);

  return (
    <div className="main-content item-details-page">
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage && <ErrorMessage message={errorMessage} />}

      {item && (
        <div className="item">
          <ItemHeader item={item} />
          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll?.map((pollResult, i) => (
                <div key={i} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    data-testid="poll-bar"
                    style={{ width: pollBarWidth(pollResult.points, item.poll_votes_count) }}
                  />
                </div>
              ))}
            </div>
          )}
          <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }} />
          <ul className="comment-list">
            {item.comments?.map((comment) => (
              <li key={comment.id}>
                <CommentTree comment={comment} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
