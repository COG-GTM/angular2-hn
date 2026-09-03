import { NavLink } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { Settings } from './Settings'

const navigation = [
  ['new', '/newest/1'],
  ['show', '/show/1'],
  ['ask', '/ask/1'],
  ['jobs', '/jobs/1'],
] as const

export function Header() {
  const { settings, toggleSettings } = useSettings()
  const scrollTop = () => window.scrollTo(0, 0)

  return (
    <header>
      <div id="header">
        <NavLink
          className="home-link"
          to="/news/1"
          onClick={scrollTop}
        >
          <div className="logo-inner" />
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              {navigation.map(([label, path], index) => (
                <span key={label}>
                  {index > 0 && ' | '}
                  <NavLink
                    to={path}
                    onClick={scrollTop}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {label}
                  </NavLink>
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="info">
          <img
            className="settings"
            src="/assets/images/cog.svg"
            alt="Settings"
            onClick={toggleSettings}
          />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  )
}
