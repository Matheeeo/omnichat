/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Profile from './pages/Profile';
import Conversations from './pages/Conversations';
import Actions from './pages/Actions';
import Settings from './pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (session) {
    return <Navigate to="/conversations" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      
      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/conversations" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="actions" element={<Actions />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
