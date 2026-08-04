interface CommentCountSample {
    count: number;
    label: string;
}

interface FoundationPreviewProps {
    theme: string;
    themes: string[];
    onThemeChange: (theme: string) => void;
    sampleCommentCounts: CommentCountSample[];
}

export function FoundationPreview({ theme, themes, onThemeChange, sampleCommentCounts }: FoundationPreviewProps) {
    return (
        <section className="foundation-preview">
            <div id="header">
                <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
            </div>
            <h1>React HN — foundation</h1>
            <p className="subtext">
                Models, theming and formatting utilities ported from the Angular app. Services, components, routing and
                the PWA shell land in later phases.
            </p>

            <h2>Theme</h2>
            {themes.map((name) => (
                <div key={name}>
                    <label>
                        <input
                            name="theme"
                            type="radio"
                            value={name}
                            checked={theme === name}
                            onChange={() => onThemeChange(name)}
                        />
                        {name}
                    </label>
                </div>
            ))}

            <h2>formatCommentCount</h2>
            <ul>
                {sampleCommentCounts.map(({ count, label }) => (
                    <li key={count} className="subtext">
                        {count} &rarr; {label}
                    </li>
                ))}
            </ul>

            <div id="footer">
                <p>
                    Show this project some &hearts; on{' '}
                    <a href="https://github.com/hdjirdeh/angular2-hn" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                </p>
            </div>
        </section>
    );
}
