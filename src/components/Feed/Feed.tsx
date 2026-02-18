import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Item, Story } from '../Item';
import './Feed.css';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

interface FeedProps {
    feedType: string;
}

const Feed: React.FC<FeedProps> = ({ feedType }) => {
    const { page } = useParams<{ page?: string }>();
    const pageNum = page ? parseInt(page, 10) : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setItems(null);
        setErrorMessage('');

        fetch(`${BASE_URL}/${feedType}?page=${pageNum}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data: Story[]) => {
                setItems(data);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                setErrorMessage(`Could not load ${feedType} stories.`);
            });
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * 30 + 1;

    if (!items && !errorMessage) {
        return (
            <div className="main-content">
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (!items && errorMessage) {
        return (
            <div className="main-content">
                <div className="error-message">{errorMessage}</div>
            </div>
        );
    }

    return (
        <div className="main-content">
            {feedType === 'jobs' && (
                <p className="job-header">
                    These are jobs at startups that were funded by Y Combinator.
                    You can also get a job at a YC startup through{' '}
                    <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                </p>
            )}

            {feedType !== 'new' ? (
                <ol
                    className={feedType !== 'jobs' ? 'list-margin' : ''}
                    start={listStart}
                >
                    {items!.map((item) => (
                        <li key={item.id} className="post">
                            <div className="item-block">
                                <Item item={item} />
                            </div>
                        </li>
                    ))}
                </ol>
            ) : (
                <div>
                    {items!.map((item) => (
                        <div key={item.id} className="post">
                            <div className="item-block">
                                <Item item={item} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="nav">
                {listStart !== 1 && (
                    <Link
                        to={`/${feedType}/${pageNum - 1}`}
                        className="prev"
                    >
                        &#8249; Prev
                    </Link>
                )}
                {items!.length === 30 && (
                    <Link
                        to={`/${feedType}/${pageNum + 1}`}
                        className="more"
                    >
                        More &#8250;
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Feed;
