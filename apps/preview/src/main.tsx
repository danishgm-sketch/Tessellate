import React from 'react';
import ReactDOM from 'react-dom/client';
import PreviewHost from './components/PreviewHost';
import './style.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<React.StrictMode><PreviewHost /></React.StrictMode>);
}
