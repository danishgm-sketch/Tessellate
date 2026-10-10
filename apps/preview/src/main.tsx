import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

export function PreviewApp() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-sm">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Tessellate Isolated Preview
        </h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Ready for secure sandboxed resource rendering.
        </p>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PreviewApp />
    </React.StrictMode>
  );
}
