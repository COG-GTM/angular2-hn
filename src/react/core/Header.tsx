import { NavLink } from 'react-router-dom';

import '../../app/core/header/header.component.scss';
import { content, host } from '../scope';
import { useSettings } from '../settings/SettingsContext';
import { Settings } from './Settings';

const c = content('header');

function scrollTop() {
    window.scrollTo(0, 0);
}

function activeClass(baseClass?: string) {
    return ({ isActive }: { isActive: boolean }) =>
        [baseClass, isActive ? 'active' : null].filter(Boolean).join(' ') || undefined;
}

export function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <header {...c}>
            <div id="header" {...c}>
                <NavLink className={activeClass('home-link')} to="/news/1" onClick={scrollTop} {...c}>
                    <div className="logo-inner" {...c}></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" {...c} />
                </NavLink>
                <div className="header-text" {...c}>
                    <div className="left" {...c}>
                        <span className="header-nav" {...c}>
                            <NavLink className={activeClass()} to="/newest/1" onClick={scrollTop} {...c}>
                                new
                            </NavLink>
                            {' | '}
                            <NavLink className={activeClass()} to="/show/1" onClick={scrollTop} {...c}>
                                show
                            </NavLink>
                            {' | '}
                            <NavLink className={activeClass()} to="/ask/1" onClick={scrollTop} {...c}>
                                ask
                            </NavLink>
                            {' | '}
                            <NavLink className={activeClass()} to="/jobs/1" onClick={scrollTop} {...c}>
                                jobs
                            </NavLink>
                        </span>
                    </div>
                </div>
                <div className="info" {...c}>
                    <img
                        className="settings"
                        src="/assets/images/cog.svg"
                        alt="Settings"
                        onClick={toggleSettings}
                        {...c}
                    />
                </div>
            </div>
            {settings.showSettings && (
                <app-settings {...c} {...host('settings')}>
                    <Settings />
                </app-settings>
            )}
        </header>
    );
}
