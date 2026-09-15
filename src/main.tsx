import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Comment, Footer, Header, Item } from './components';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import type { Story } from './models';
import './styles/app.scss';
import './styles/global.scss';

const linkedStory: Story = {
    id: 1,
    title: 'A sample linked story',
    points: 42,
    user: 'sample-user',
    time: 0,
    time_ago: 1,
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
};

const jobStory: Story = {
    id: 2,
    title: 'A sample job without a URL',
    points: 0,
    user: 'sample-company',
    time: 0,
    time_ago: 2,
    type: 'job',
    url: '',
    domain: '',
    comments: [],
    comments_count: 0,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
};

const sampleComment = {
    id: 1,
    level: 0,
    user: 'commenter',
    time: 0,
    time_ago: '1 hour ago',
    content: '<strong>A sample comment</strong> with nested discussion.',
    deleted: false,
    comments: [
        {
            id: 2,
            level: 1,
            user: 'reply-user',
            time: 0,
            time_ago: '30 minutes ago',
            content: 'A nested child comment.',
            deleted: false,
            comments: [],
        },
    ],
};

function Preview() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover">
                <div className="wrapper">
                    <Header />
                    <main>
                        <Item item={linkedStory} />
                        <Item item={jobStory} />
                        <Comment comment={sampleComment} />
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <SettingsProvider>
            <Preview />
        </SettingsProvider>
    </BrowserRouter>,
);
