import { useLocation } from 'react-router';
import './Placeholder.scss';

export default function Placeholder() {
    const { pathname } = useLocation();

    return (
        <main className="placeholder">
            <img className="placeholder__logo" src="/assets/images/logo.svg" alt="Angular 2 HN logo" />
            <h1>React HN</h1>
            <p>The React migration of angular2-hn is under construction.</p>
            <p className="placeholder__path">
                Route: <code>{pathname}</code>
            </p>
        </main>
    );
}
