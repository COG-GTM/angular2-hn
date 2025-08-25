import React, { useEffect } from 'react';

interface HeaderComponentProps {
  settings: {
    showSettings: boolean;
  };
  onToggleSettings: () => void;
}

export const HeaderComponent: React.FC<HeaderComponentProps> = ({
  settings,
  onToggleSettings
}) => {
  useEffect(() => {
  }, []);

  const scrollTop = () => {
    window.scrollTo(0, 0);
  };

  const toggleSettings = () => {
    onToggleSettings();
  };

  return (
    <header>
      <div id="header">
        <a className="home-link" href="/news/1" onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src="assets/images/logo.svg" alt="Logo" />
        </a>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <a href="/newest/1" onClick={scrollTop}>new</a>
              |
              <a href="/show/1" onClick={scrollTop}>show</a>
              |
              <a href="/ask/1" onClick={scrollTop}>ask</a>
              |
              <a href="/jobs/1" onClick={scrollTop}>jobs</a>
            </span>
          </div>
        </div>
        <div className="info">
          <img 
            className="settings" 
            src="assets/images/cog.svg" 
            alt="Settings" 
            onClick={toggleSettings}
          />
        </div>
      </div>
      {settings.showSettings && <div>TODO: Settings component</div>}
    </header>
  )
};
