import { AppProvider } from './context/AppContext';
import { MobileShell } from './components/layout/MobileShell';

export function App() {
  return (
    <AppProvider>
      <MobileShell />
    </AppProvider>
  );
}

export default App;
