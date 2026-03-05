import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LayoutDashboard, PlusCircle, History, LogOut, Store } from 'lucide-react';

export default function Layout() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar/Bottom Nav */}
            <nav className="bg-white border-r border-slate-200 md:w-64 max-md:fixed max-md:bottom-0 max-md:w-full max-md:border-t max-md:z-50 flex flex-col justify-between">
                <div>
                    <div className="p-6 hidden md:flex items-center space-x-3 text-blue-600">
                        <Store className="w-8 h-8" />
                        <span className="text-2xl font-bold">SmartTill</span>
                    </div>

                    <div className="flex md:flex-col p-2 md:p-4 gap-2 justify-around md:justify-start">
                        {role === 'owner' && (
                            <NavLink
                                to="/"
                                className={({ isActive }) => `flex flex-col md:flex-row items-center p-3 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <LayoutDashboard className="w-6 h-6 md:mr-3" />
                                <span className="text-xs md:text-base font-medium mt-1 md:mt-0">Dashboard</span>
                            </NavLink>
                        )}

                        <NavLink
                            to="/add"
                            className={({ isActive }) => `flex flex-col md:flex-row items-center p-3 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <PlusCircle className="w-6 h-6 md:mr-3" />
                            <span className="text-xs md:text-base font-medium mt-1 md:mt-0">Add Sale</span>
                        </NavLink>

                        {role === 'owner' && (
                            <NavLink
                                to="/history"
                                className={({ isActive }) => `flex flex-col md:flex-row items-center p-3 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <History className="w-6 h-6 md:mr-3" />
                                <span className="text-xs md:text-base font-medium mt-1 md:mt-0">History</span>
                            </NavLink>
                        )}
                    </div>
                </div>

                <div className="hidden md:block p-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-6 h-6 mr-3" />
                        <span className="font-medium">Logout ({role})</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto max-md:pb-24">
                <div className="max-w-5xl mx-auto p-4 md:p-8">
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm">
                        <div className="flex items-center space-x-2 text-blue-600">
                            <Store className="w-6 h-6" />
                            <span className="text-xl font-bold">SmartTill</span>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    <Outlet />
                </div>
            </main>
        </div>
    );
}
