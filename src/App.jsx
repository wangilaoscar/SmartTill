import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddSale from './components/AddSale';
import SalesHistory from './components/SalesHistory';

function ProtectedRoute({ children, allowedRoles }) {
    const { role } = useAuth();

    if (!role) {
        return <Login />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/add" replace />;
    }

    return children;
}

function AppContent() {
    const { role } = useAuth();

    if (!role) {
        return <Login />;
    }

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* Owner Dashboard */}
                <Route index element={
                    <ProtectedRoute allowedRoles={['owner']}>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                {/* Shared Routes */}
                <Route path="add" element={<AddSale />} />
                <Route path="history" element={<SalesHistory />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to={role === 'owner' ? '/' : '/add'} replace />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
