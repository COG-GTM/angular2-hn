import { SettingsProvider } from './shared/settings/SettingsContext';
import { AppRoutes } from './app/routes';
import { FeedPlaceholder, ItemDetailsPlaceholder, UserPlaceholder } from './app/placeholders';

function App() {
    return (
        <SettingsProvider>
            <AppRoutes Feed={FeedPlaceholder} ItemDetails={ItemDetailsPlaceholder} User={UserPlaceholder} />
        </SettingsProvider>
    );
}

export default App;
