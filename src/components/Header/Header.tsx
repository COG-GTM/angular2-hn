import { NavLink } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import styles from './Header.module.scss'

function scrollTop() {
    window.scrollTo(0, 0)
}

export function Header() {
    const { settings, toggleSettings } = useSettings()

    return (
        <header>
            <div id="header">
                <NavLink className={styles['home-link']} to="/news/1" onClick={scrollTop}>
                    <div className={styles['logo-inner']}></div>
                    <img className={styles.logo} src="assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className={styles['header-text']}>
                    <div className={styles.left}>
                        <span className={styles['header-nav']}>
                            <NavLink to="/newest/1" onClick={scrollTop}>
                                new
                            </NavLink>
                            {' | '}
                            <NavLink to="/show/1" onClick={scrollTop}>
                                show
                            </NavLink>
                            {' | '}
                            <NavLink to="/ask/1" onClick={scrollTop}>
                                ask
                            </NavLink>
                            {' | '}
                            <NavLink to="/jobs/1" onClick={scrollTop}>
                                jobs
                            </NavLink>
                        </span>
                    </div>
                </div>
                <div className={styles.info}>
                    <img
                        className={styles.settings}
                        src="assets/images/cog.svg"
                        alt="Settings"
                        onClick={toggleSettings}
                    />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    )
}

function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings()

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <h1>Settings</h1>
                <hr />
                <span className={styles.close} onClick={toggleSettings}>
                    &times;
                </span>
                <div className={styles.content}>
                    <div className={styles['control-section']}>
                        <h2>Links</h2>
                        <input
                            type="checkbox"
                            checked={settings.openLinkInNewTab}
                            onChange={toggleOpenLinksInNewTab}
                        />{' '}
                        Open links in a new tab
                    </div>
                    <div className={styles['theme-controls']}>
                        <div className={styles['control-section']}>
                            <h2>Select a theme</h2>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="default"
                                        checked={settings.theme === 'default'}
                                        onChange={() => setTheme('default')}
                                    />{' '}
                                    Default
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="night"
                                        checked={settings.theme === 'night'}
                                        onChange={() => setTheme('night')}
                                    />{' '}
                                    Night
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="amoledblack"
                                        checked={settings.theme === 'amoledblack'}
                                        onChange={() => setTheme('amoledblack')}
                                    />{' '}
                                    Black (AMOLED)
                                </label>
                            </div>
                        </div>
                        <div className={styles['control-section']}>
                            <h2>Change Font</h2>
                            <div>
                                <label>
                                    Font size:
                                    <input
                                        min="1"
                                        value={settings.titleFontSize}
                                        type="number"
                                        onChange={(e) => setFont(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        min="0"
                                        value={settings.listSpacing}
                                        type="number"
                                        onChange={(e) => setSpacing(e.target.value)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
