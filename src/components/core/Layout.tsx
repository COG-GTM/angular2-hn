import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
    return (
        <>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <main id="content">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </>
    );
}
