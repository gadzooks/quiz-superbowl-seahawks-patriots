import { AppRouter } from './AppRouter';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

export function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AppProvider>
  );
}
