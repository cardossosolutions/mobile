import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import ResetPasswordScreen from './components/auth/ResetPasswordScreen';
import ResetPasswordScreen from './components/auth/ResetPasswordScreen';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/reset-senha/:hash" element={<ResetPasswordScreen />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
            <Route path="/reset-senha/:hash" element={<ResetPasswordScreen />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  </StrictMode>
);
