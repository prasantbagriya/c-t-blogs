import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import App from './App.tsx';
import './index.css';

console.log("HELLO FROM MAIN.TSX - START");

console.log("HELLO FROM MAIN.TSX - ABOUT TO RENDER", document.getElementById('root'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);

console.log("HELLO FROM MAIN.TSX - RENDER CALLED");
