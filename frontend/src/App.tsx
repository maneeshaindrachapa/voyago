import { ClerkProvider } from '@clerk/clerk-react';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import AuthenticationPage from './pages/AuthenticationPage';
import ProtectedRoute from './ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardPage } from './pages/Dashboard';
import { TripProvider } from './context/TripContext';

const App: React.FC = () => {
  const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_FRONTEND_API;

  if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key');
  }

  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Router>
          <Routes>
            {/* Public route */}
            <Route path="/" element={<AuthenticationPage />} />
            <Route path="/auth" element={<AuthenticationPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <TripProvider>
                    <DashboardPage />
                  </TripProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ClerkProvider>
    </ThemeProvider>
  );
};

export default App;
