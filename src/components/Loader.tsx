import './Loader.scss';

// Port of src/app/shared/components/loader/loader.component.html + .scss
export default function Loader() {
    return (
        <div className="loading-section">
            <div className="loader">
                Loading...
            </div>
        </div>
    );
}
