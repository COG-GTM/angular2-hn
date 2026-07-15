import { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';

interface RenderOptions {
    route?: string;
    withRouter?: boolean;
}

export function AllProviders({
    children,
    route = '/',
    withRouter = true,
}: {
    children: ReactNode;
    route?: string;
    withRouter?: boolean;
}) {
    const content = <SettingsProvider>{children}</SettingsProvider>;
    if (!withRouter) {
        return content;
    }
    return <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>;
}

export function renderWithProviders(ui: ReactElement, { route = '/', withRouter = true }: RenderOptions = {}) {
    return render(<AllProviders route={route} withRouter={withRouter}>{ui}</AllProviders>);
}
