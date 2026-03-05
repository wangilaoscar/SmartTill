import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { Store, ArrowRight, Loader2, LogOut } from 'lucide-react';

export default function SetupShop() {
    const { session, logout, setRole, setShopId } = useAuth();
    const [shopName, setShopName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleCreateShop = async (e) => {
        e.preventDefault();
        if (!shopName.trim()) return;

        setLoading(true);
        setErrorMsg('');

        try {
            // Generate a UUID locally so we don't have to rely on .select()
            const newShopId = crypto.randomUUID();

            // 1. Create the shop
            const { error: shopError } = await supabase
                .from('shops')
                .insert([{ id: newShopId, name: shopName }]);

            if (shopError) throw shopError;

            // 2. Assign the user as 'owner' of this shop
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert([{
                    user_id: session.user.id,
                    shop_id: newShopId,
                    role: 'owner'
                }]);

            if (roleError) throw roleError;

            // 3. Update local context so they immediately enter the app
            setShopId(newShopId);
            setRole('owner');

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
                        <Store className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to SmartTill</h1>
                    <p className="text-slate-500">Let's get your shop set up before we begin.</p>
                </div>

                <form onSubmit={handleCreateShop} className="p-8 pt-0 space-y-6">
                    {errorMsg && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">What is your shop's name?</label>
                        <input
                            required
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full text-lg p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            placeholder="e.g. Corner Coffee Shop"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !shopName.trim()}
                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                Create Shop
                                <ArrowRight className="w-6 h-6 ml-2" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
