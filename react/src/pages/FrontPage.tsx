import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchFrontPageForDate } from '../api/algolia';
import ErrorMessage from '../components/ErrorMessage';
import Item from '../components/Item';
import Loader from '../components/Loader';
import type { Story } from '../models';
import './FrontPage.scss';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(value: string): boolean {
    return DATE_PATTERN.test(value) && toDateString(parseDateString(value)) === value;
}

function toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDateString(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function FrontPage() {
    const params = useParams();
    const navigate = useNavigate();

    const todayString = toDateString(new Date());
    const dateString = params.date && isValidDateString(params.date) ? params.date : todayString;
    const date = useMemo(() => parseDateString(dateString), [dateString]);

    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItems(null);
        setErrorMessage('');

        fetchFrontPageForDate(date)
            .then((stories) => {
                if (cancelled) {
                    return;
                }
                setItems(stories);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage(`Could not load stories for ${dateString}.`);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [date, dateString]);

    const goToDate = (target: Date) => {
        navigate(`/front-page/${toDateString(target)}`);
    };

    const shiftDay = (days: number) => {
        const target = new Date(date);
        target.setDate(target.getDate() + days);
        goToDate(target);
    };

    const isToday = dateString === todayString;

    const previousYears = useMemo(() => {
        const years: string[] = [];
        for (let i = 1; i <= 5; i++) {
            const target = new Date(date);
            target.setFullYear(target.getFullYear() - i);
            years.push(toDateString(target));
        }
        return years;
    }, [date]);

    const headingDate = date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className='main-content front-page'>
            <div className='front-page-header'>
                <h2>Front page on {headingDate}</h2>
                <div className='date-controls'>
                    <button type='button' onClick={() => shiftDay(-1)}>‹ Previous day</button>
                    <input
                        type='date'
                        value={dateString}
                        max={todayString}
                        onChange={(event) => {
                            if (event.target.value) {
                                goToDate(parseDateString(event.target.value));
                            }
                        }}
                        aria-label='Pick a date'
                    />
                    <button type='button' onClick={() => shiftDay(1)} disabled={isToday}>Next day ›</button>
                    <button type='button' onClick={() => goToDate(new Date())} disabled={isToday}>Today</button>
                </div>
                <div className='previous-years'>
                    <span>On this day: </span>
                    {previousYears.map((value, index) => (
                        <span key={value}>
                            {index > 0 && ' | '}
                            <Link to={`/front-page/${value}`}>{value.slice(0, 4)}</Link>
                        </span>
                    ))}
                </div>
            </div>

            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && items.length === 0 && (
                <p className='empty-state'>No stories found for this day.</p>
            )}

            {items && items.length > 0 && (
                <ol className='list-margin' start={1}>
                    {items.map((item) => (
                        <li key={item.id} className='post'>
                            <div className='item-block'>
                                <Item item={item} />
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

export default FrontPage;
