import React from 'react';
import { useAuth } from '../AuthContext';
import { Store, User } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 pb-6 text-center bg-blue-600 text-white">
                    <Store className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl font-bold mb-2">SmartTill</h1>
                    <p className="text-blue-100">Select your role to continue</p>
                </div>

                <div className="p-8 space-y-4">
                    <button
                        onClick={() => login('owner')}
                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Store className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-slate-800">Shop Owner</h3>
                                <p className="text-sm text-slate-500">View dashboard and monitor sales</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => login('worker')}
                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-slate-800">Shop Worker</h3>
                                <p className="text-sm text-slate-500">Record new sales transactions</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
