import React from 'react';
import ReactDOM from 'react-dom/client';
import { SessionProvider } from './context/SessionContext';
import { ThemeProvider } from './context/ThemeContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { EinsteinProvider } from './context/EinsteinContext';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <SessionProvider>
        <SubscriptionProvider>
          <EinsteinProvider>
            <AppErrorBoundary>
              <App />
            </AppErrorBoundary>
          </EinsteinProvider>
        </SubscriptionProvider>
      </SessionProvider>
    </ThemeProvider>
  </React.StrictMode>
);
