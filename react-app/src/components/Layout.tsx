import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="app">
            <header>
                <h1>React HN</h1>
                <nav>
                    <Link to="/news/1">News</Link> | <Link to="/newest/1">Newest</Link> |{' '}
                    <Link to="/show/1">Show</Link> | <Link to="/ask/1">Ask</Link> | <Link to="/jobs/1">Jobs</Link>
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}
