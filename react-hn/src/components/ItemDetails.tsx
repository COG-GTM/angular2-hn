import React from 'react';
import { useParams } from 'react-router-dom';
import { useItem } from '../services/api';

const ItemDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const itemId = parseInt(id || '0', 10);
    
    const { data: item, isLoading, error } = useItem(itemId);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading item details.</div>;

    return (
        <div>
            <h1>{item?.title}</h1>
            <p>Points: {item?.points} | User: {item?.user}</p>
            <p>Comments: {item?.comments_count}</p>
            {item?.url && <a href={item.url} target="_blank" rel="noopener noreferrer">Read More</a>}
        </div>
    );
};

export default ItemDetails;
