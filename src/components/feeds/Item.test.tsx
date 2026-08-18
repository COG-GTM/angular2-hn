import { screen } from '@testing-library/react';
import Item from './Item';
import { renderWithProviders } from '../../test/renderWithProviders';
import { mockInternalStory, mockJobStory, mockStory } from '../../test/fixtures';

describe('Item', () => {
    it('renders an external link with the story domain', () => {
        renderWithProviders(<Item item={mockStory} />);

        const link = screen.getByRole('link', { name: mockStory.title });
        expect(link).toHaveAttribute('href', mockStory.url);
        expect(link).not.toHaveAttribute('target');
        expect(screen.getByText(`(${mockStory.domain})`)).toBeInTheDocument();
    });

    it('links internally when the story has no external url', () => {
        renderWithProviders(<Item item={mockInternalStory} />);

        expect(screen.getByRole('link', { name: mockInternalStory.title })).toHaveAttribute(
            'href',
            `/item/${mockInternalStory.id}`
        );
    });

    it('opens external links in a new tab when the setting is enabled', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<Item item={mockStory} />);

        const link = screen.getByRole('link', { name: mockStory.title });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('applies the configured title font size and list spacing', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '9');

        const { container } = renderWithProviders(<Item item={mockStory} />);

        expect(container.firstChild).toHaveStyle({ marginBottom: '9px' });
        expect(screen.getByRole('link', { name: mockStory.title })).toHaveStyle({ fontSize: '22px' });
    });

    it('renders points, user and comment count', () => {
        renderWithProviders(<Item item={mockStory} />);

        expect(screen.getAllByRole('link', { name: mockStory.user })).toHaveLength(2);
        expect(screen.getAllByRole('link', { name: '5 comments' })).not.toHaveLength(0);
        expect(screen.getAllByText(mockStory.time_ago)).not.toHaveLength(0);
    });

    it('hides points and comments for job postings', () => {
        renderWithProviders(<Item item={mockJobStory} />);

        expect(screen.queryByText('discuss')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: mockJobStory.user })).not.toBeInTheDocument();
    });
});
