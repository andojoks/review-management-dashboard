import { createRoot } from 'react-dom/client';
import App from './App';
import '../app.css';
import '../css/overview.css';
import '../css/insights.css';
import '../css/reviews.css';
import '../css/pros.css';
import '../css/clients.css';
import '../css/documents.css';
import '../css/inbox.css';
import '../css/settings.css';

createRoot(document.getElementById('root')!).render(<App />);
