import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Store, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                // Supabase might require email verification, but usually auto-signs in on local dev if configured.
                alert('Account created! If you don\'t see the dashboard, please check your email for a verification link.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 pb-6 text-center bg-blue-600 text-white">
                    <Store className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl font-bold mb-2">SmartTill</h1>
                    <p className="text-blue-100">Your digital notebook, but smarter.</p>
                </div>

                <div className="p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
                        {isSignUp ? 'Create a New Account' : 'Sign in to your account'}
                    </h2>

                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-6 text-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                placeholder="••••••••"
                                minLength="6"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 mt-4"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? 'Sign Up' : 'Sign In'}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-slate-100 pt-6">
                        <p className="text-slate-500 text-sm flex items-center justify-center space-x-2">
                            <span>{isSignUp ? 'Already have an account?' : 'Don\'t have a shop yet?'}</span>
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setErrorMsg('');
                                }}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
