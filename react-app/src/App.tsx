import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { SettingsProvider } from './services/SettingsContext';
import { useSettings } from './services/useSettings';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Feed from './components/Feed/Feed';
import ItemDetails from './components/ItemDetails/ItemDetails';
import UserProfile from './components/User/User';
import './styles/globals.scss';
import './App.scss';

function FeedRoute({ feedType }: { feedType: string }) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? parseInt(page, 10) : 1;
    return <Feed key={`${feedType}-${pageNum}`} feedType={feedType} pageNum={pageNum} />;
}

function ItemRoute() {
    const { id } = useParams<{ id: string }>();
    const itemId = id ? parseInt(id, 10) : 0;
    return <ItemDetails key={itemId} itemId={itemId} />;
}

function UserRoute() {
    const { id } = useParams<{ id: string }>();
    return <UserProfile key={id} userId={id ?? ''} />;
}

function AppShell() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<FeedRoute feedType="news" />} />
                    <Route path="/newest/:page" element={<FeedRoute feedType="newest" />} />
                    <Route path="/show/:page" element={<FeedRoute feedType="show" />} />
                    <Route path="/ask/:page" element={<FeedRoute feedType="ask" />} />
                    <Route path="/jobs/:page" element={<FeedRoute feedType="jobs" />} />
                    <Route path="/item/:id" element={<ItemRoute />} />
                    <Route path="/user/:id" element={<UserRoute />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AppShell />
            </SettingsProvider>
        </BrowserRouter>
    );
}
