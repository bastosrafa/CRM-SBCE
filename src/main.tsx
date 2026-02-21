import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SetupEnvPage } from './SetupEnvPage';
import './index.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const root = createRoot(document.getElementById('root')!);

if (!isSupabaseConfigured) {
  root.render(<SetupEnvPage />);
} else {
  import('./App').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
}
