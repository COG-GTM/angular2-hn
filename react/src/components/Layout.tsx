import { Outlet } from 'react-router-dom';

import { useSettings } from '../context/useSettings';

export default function Layout() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Outlet />
            </div>
        </div>
    );
}
