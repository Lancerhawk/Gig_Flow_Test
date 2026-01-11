import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useSocket } from './hooks/useSocket';
import { CurrencyProvider } from './contexts/CurrencyContext';
import AuthProvider from './components/AuthProvider';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import GigFeed from './pages/GigFeed';
import CreateGig from './pages/CreateGig';
import GigDetails from './pages/GigDetails';
import Dashboard from './pages/Dashboard';
import { useEffect } from 'react';

function AppContent() {
  useSocket(); // Initialize socket connection

  useEffect(() => {
    console.log('AppContent mounted');
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <GigFeed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gigs/create"
            element={
              <ProtectedRoute>
                <CreateGig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gigs/:id"
            element={
              <ProtectedRoute>
                <GigDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function App() {
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <CurrencyProvider>
          <Router>
            <AppContent />
          </Router>
        </CurrencyProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
