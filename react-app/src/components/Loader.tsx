import './Loader.scss';

/** Port of src/app/shared/components/loader. */
export function Loader() {
    return (
        <div className="loading-section" role="status" aria-live="polite">
            <div className="loader">Loading...</div>
        </div>
    );
}
