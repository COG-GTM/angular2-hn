import React from 'react';
import ReactDOM from 'react-dom/client';

import './react/styles/styles.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <div className="default">
            <div className="body-cover"></div>
            <div className="wrapper"></div>
        </div>
    </React.StrictMode>
);
