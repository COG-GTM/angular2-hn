import { BrowserRouter } from 'react-router-dom';
import './App.scss';

function App() {
    return (
        <BrowserRouter>
            <div className="default">
                <div className="body-cover"></div>
                <div className="wrapper">
                    <header id="header">
                        <h1>Hacker News</h1>
                    </header>
                    <main>
                        <p>React 18 + Vite app shell loaded successfully.</p>
                    </main>
                    <footer id="footer">
                        <p>Built with React</p>
                    </footer>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
