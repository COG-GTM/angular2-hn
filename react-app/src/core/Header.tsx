import { Link } from 'react-router-dom';

export function Header() {
    return (
        <header>
            <div id="header">
                <Link className="home-link" to="/news/1">
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </Link>
            </div>
        </header>
    );
}
