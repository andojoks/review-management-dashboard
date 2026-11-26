import { createRoot } from 'react-dom/client';
import App from './App';
import { installTestBridge } from './app/testBridge';
import '../app.css';
import '../css/overview.css';
import '../css/reviews.css';
import '../css/pros.css';

installTestBridge();

createRoot(document.getElementById('root')!).render(<App />);
