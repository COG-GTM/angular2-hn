import { render } from '@testing-library/react';
import { SafeHtml } from './SafeHtml';

describe('SafeHtml', () => {
    it('renders formatting markup and links', () => {
        const { container } = render(<SafeHtml html={'<p>Hi <i>there</i> <a href="https://x.y">link</a></p>'} />);
        expect(container.querySelector('div i')).toHaveTextContent('there');
        expect(container.querySelector('a')).toHaveAttribute('href', 'https://x.y');
    });

    it('strips scripts and event handlers', () => {
        const { container } = render(
            <SafeHtml as="p" className="subject" html={'<img src="x" onerror="alert(1)"><script>alert(2)</script>ok'} />
        );
        const el = container.querySelector('p.subject')!;
        expect(el.innerHTML).not.toMatch(/script|onerror/);
        expect(el).toHaveTextContent('ok');
    });

    it('renders nothing for missing html', () => {
        const { container } = render(<SafeHtml as="span" html={undefined} />);
        expect(container.querySelector('span')).toBeEmptyDOMElement();
    });
});
