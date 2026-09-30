import { NavLink, type NavLinkProps } from 'react-router-dom';
import { classNames } from '../utils/classNames';

type RouterLinkProps = Omit<NavLinkProps, 'className'> & { className?: string };

/** Mirrors Angular's `routerLink` + `routerLinkActive="active"` pairing. */
export function RouterLink({ className, ...props }: RouterLinkProps) {
    return <NavLink {...props} className={({ isActive }) => classNames(className, isActive && 'active')} />;
}
