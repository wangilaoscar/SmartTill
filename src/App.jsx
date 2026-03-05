import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import SetupShop from './components/SetupShop';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddSale from './components/AddSale';
import SalesHistory from './components/SalesHistory';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, allowedRoles }) {
    const { session, role, shopId } = useAuth();

    // 1. User must be signed in
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // 2. User must have a shop assigned (otherwise they need to create one)
    if (!shopId) {
        return <Navigate to="/setup" replace />;
    }

    // 3. Optional Role check (e.g., only owners can view dashboard)
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/add" replace />;
    }

    return children;
}

function GlobalAuthRouter() {
    const { session, shopId, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/setup" element={(session && !shopId) ? <SetupShop /> : <Navigate to="/" replace />} />

            {/* Main App Layout */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                {/* Owner Dashboard */}
                <Route index element={
                    <ProtectedRoute allowedRoles={['owner']}>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                {/* Shared Routes */}
                <Route path="add" element={<AddSale />} />
                <Route path="history" element={
                    <ProtectedRoute allowedRoles={['owner']}>
                        <SalesHistory />
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <GlobalAuthRouter />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
