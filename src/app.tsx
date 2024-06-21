import React from 'react'
import { createRoot } from 'react-dom/client';
import App from './components/H5App'
import {
    Route,
    Routes,
    HashRouter
} from 'react-router-dom';
const container = document.getElementById('react-main')
const root = createRoot(container!)
function Main() {
    return (
        <HashRouter>
            <Routes>
                <Route path='*' element={<App />} />
            </Routes>
        </HashRouter>
    )
}

root.render(<Main />);
