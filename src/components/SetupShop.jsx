import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { Store, ArrowRight, Loader2, LogOut, UserPlus } from 'lucide-react';

export default function SetupShop() {
    const { session, logout, setRole, setShopId } = useAuth();
    const [mode, setMode] = useState('create'); // 'create' or 'join'
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setLoading(true);
        setErrorMsg('');

        try {
            let activeShopId = inputValue.trim();
            const newShopId = crypto.randomUUID();

            if (mode === 'create') {
                // 1. Create the shop
                const { error: shopError } = await supabase
                    .from('shops')
                    .insert([{ id: newShopId, name: inputValue }]);

                if (shopError) throw shopError;
                activeShopId = newShopId;
                console.log("activeShopId", activeShopId)
            } else {
                // Verify the shop exists
                const { data, error } = await supabase
                    .from('shops')
                    .select('id')
                    .eq('id', activeShopId)
                    .single();

                if (error || !data) {
                    // For development purposes: attempt to fetch all shops and log them
                    const { data: allShops } = await supabase.from('shops').select('id, name');
                    console.log("Development info - Available shops in DB:", allShops);

                    throw new Error("Invalid Shop Invite Code. Please check and try again.");
                }
            }

            // 2. Assign the user role
            const roleToAssign = mode === 'create' ? 'owner' : 'worker';
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert([{
                    user_id: session.user.id,
                    shop_id: activeShopId,
                    role: roleToAssign
                }]);

            if (roleError) {
                if (roleError.code === '23505') throw new Error("You are already a member of this shop.");
                throw roleError;
            }

            // 3. Update local context
            setShopId(activeShopId);
            setRole(roleToAssign);

        } catch (error) {
            console.error(error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <button
                    onClick={logout}
                    className="flex items-center space-x-2 text-slate-500 hover:text-red-500 font-medium bg-white px-4 py-2 rounded-lg shadow-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="p-8 pb-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {mode === 'create' ? <Store className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to SmartTill</h1>
                    <p className="text-slate-500">Choose how you want to get started.</p>
                </div>

                <div className="px-8 mb-6 flex rounded-xl bg-slate-100 p-1 mx-8 relative">
                    <button
                        onClick={() => { setMode('create'); setInputValue(''); setErrorMsg(''); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all z-10 ${mode === 'create' ? 'bg-white text-blue-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Owner (Create)
                    </button>
                    <button
                        onClick={() => { setMode('join'); setInputValue(''); setErrorMsg(''); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all z-10 ${mode === 'join' ? 'bg-white text-blue-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Worker (Join)
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
                    {errorMsg && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center break-words">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {mode === 'create' ? 'What is your shop\'s name?' : 'Enter Shop Invite Code'}
                        </label>
                        <input
                            required
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full text-lg p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            placeholder={mode === 'create' ? "e.g. Corner Coffee Shop" : "Paste the long code from your owner"}
                        />
                        {mode === 'join' && <p className="text-xs text-slate-400 mt-2">Ask your shop owner for their Invite Code found on their Dashboard.</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !inputValue.trim()}
                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                {mode === 'create' ? 'Create Shop' : 'Join Shop'}
                                <ArrowRight className="w-6 h-6 ml-2" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
