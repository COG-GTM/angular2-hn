import { ErrorMessage } from './shared/components/ErrorMessage/ErrorMessage';
import { Loader } from './shared/components/Loader/Loader';

interface ComponentsPreviewProps {
    theme: string;
    themes: string[];
    onThemeChange: (theme: string) => void;
}

/**
 * Throwaway Phase 1b scaffolding so the shared leaf components can be reviewed
 * under every theme. Phase 3 removes this along with the other preview routes.
 */
export function ComponentsPreview({ theme, themes, onThemeChange }: ComponentsPreviewProps) {
    return (
        <section className="components-preview">
            <h1>Shared components</h1>

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

            <h2>Loader</h2>
            <Loader />

            <h2>ErrorMessage</h2>
            <ErrorMessage message="There was a problem loading this feed." />
        </section>
    );
}
