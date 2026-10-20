import './Loader.scss';

/** Port of `app-loader` (shared/components/loader). Themed by `_themes.scss` (`.wrapper .loader`). */
export function Loader() {
    return (
        <div className="loading-section" role="status" aria-live="polite">
            <div className="loader">Loading...</div>
        </div>
    );
}
