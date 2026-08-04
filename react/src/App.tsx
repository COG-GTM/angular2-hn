import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Footer } from './core/Footer/Footer';
import { Header } from './core/Header/Header';
import { formatCommentCount } from './shared/utils/comment';
import { ComponentsPreview } from './ComponentsPreview';
import { FoundationPreview } from './FoundationPreview';
import { ServicesPreview } from './ServicesPreview';
import { Feed } from './feeds/Feed/Feed';
import './App.scss';

const THEMES = ['default', 'night', 'amoledblack'];

/**
 * Phase 0 shell. The real Header / router-outlet / Footer layout arrives in Phase 3;
 * for now this renders the ported theming so the foundation is verifiable end to end.
 */
export default function App() {
    const [theme, setTheme] = useState<string>(THEMES[0]);

    return (
        <div className={theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/preview/services" element={<ServicesPreview />} />
                    <Route
                        path="/preview/components"
                        element={<ComponentsPreview theme={theme} themes={THEMES} onThemeChange={setTheme} />}
                    />
                    <Route path="/news/:page" element={<Feed feedType="news" />} />
                    <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                    <Route path="/show/:page" element={<Feed feedType="show" />} />
                    <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                    <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                    <Route
                        path="*"
                        element={
                            <FoundationPreview
                                theme={theme}
                                themes={THEMES}
                                onThemeChange={setTheme}
                                sampleCommentCounts={[0, 1, 42].map((count) => ({
                                    count,
                                    label: formatCommentCount(count),
                                }))}
                            />
                        }
                    />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}
