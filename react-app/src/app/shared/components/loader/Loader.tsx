import './loader.scss';

export function Loader(): JSX.Element {
    return (
        <app-loader>
            <div className="loading-section">
                <div className="loader">Loading...</div>
            </div>
        </app-loader>
    );
}
