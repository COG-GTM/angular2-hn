import './Loader.scss';

/** Port of <app-loader>. */
export function Loader() {
  return (
    <div className="app-loader">
      <div className="loading-section">
        <div className="loader">Loading...</div>
      </div>
    </div>
  );
}
