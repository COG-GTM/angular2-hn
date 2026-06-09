import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Feed } from './pages/Feed';
import { ItemDetails } from './pages/ItemDetails';
import { UserProfile } from './pages/UserProfile';

// Wrappers add a key derived from the route params so the page component
// remounts (and refetches with a fresh loading state) when the param changes.
function FeedRoute({ feedType }: { feedType: string }) {
    const { page } = useParams();
    return <Feed key={`${feedType}-${page}`} feedType={feedType} />;
}

function ItemRoute() {
    const { id } = useParams();
    return <ItemDetails key={id} />;
}

function UserRoute() {
    const { id } = useParams();
    return <UserProfile key={id} />;
}

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                <Route
                    path="/news/:page"
                    element={<FeedRoute feedType="news" />}
                />
                <Route
                    path="/newest/:page"
                    element={<FeedRoute feedType="newest" />}
                />
                <Route
                    path="/show/:page"
                    element={<FeedRoute feedType="show" />}
                />
                <Route
                    path="/ask/:page"
                    element={<FeedRoute feedType="ask" />}
                />
                <Route
                    path="/jobs/:page"
                    element={<FeedRoute feedType="jobs" />}
                />
                <Route path="/item/:id" element={<ItemRoute />} />
                <Route path="/user/:id" element={<UserRoute />} />
            </Route>
        </Routes>
    );
}

export default App;
