import AppRoutes from './router/AppRoutes';
import './App.scss';

export default function App() {
    return (
        <div className="default">
            <div className="body-cover"></div>
            <div className="wrapper">
                <AppRoutes />
            </div>
        </div>
    );
}
