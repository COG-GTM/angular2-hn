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
                            name="preview-theme"
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
        </section>
    );
}
