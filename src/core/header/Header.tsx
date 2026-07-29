import { NavLink } from 'react-router-dom';
import { useSettings } from '../../shared/context';
import './Header.scss';

const navClassName = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

export default function Header() {
    const { toggleSettings } = useSettings();

    const scrollTop = () => {
        window.scrollTo(0, 0);
    };

    return (
        <header>
            <div id="header">
                <NavLink className={({ isActive }) => (isActive ? 'home-link active' : 'home-link')} to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink to="/newest/1" className={navClassName} onClick={scrollTop}>new</NavLink>
                            {' | '}
                            <NavLink to="/show/1" className={navClassName} onClick={scrollTop}>show</NavLink>
                            {' | '}
                            <NavLink to="/ask/1" className={navClassName} onClick={scrollTop}>ask</NavLink>
                            {' | '}
                            <NavLink to="/jobs/1" className={navClassName} onClick={scrollTop}>jobs</NavLink>
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
                </div>
            </div>
        </header>
    );
}
