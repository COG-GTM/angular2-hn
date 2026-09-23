import './loader.scss';

/** Port of the Angular `app-loader` component (`src/app/shared/components/loader`). */
export function Loader() {
    return (
        <div className="loading-section">
            <div className="loader">Loading...</div>
        </div>
    );
}
