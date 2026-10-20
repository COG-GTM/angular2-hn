import './Loader.scss';

/** Port of `app-loader` (`LoaderComponent`): three animated bars, text hidden off-screen via CSS. */
export function Loader() {
    return (
        <div className="app-loader-component">
            <div className="loading-section">
                <div className="loader" role="status" aria-live="polite">
                    Loading...
                </div>
            </div>
        </div>
    );
}
