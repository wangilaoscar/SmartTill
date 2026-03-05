import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { CheckCircle2, PackageSearch, Tag, Receipt, Wallet, Plus } from 'lucide-react';

export default function AddSale() {
    const { shopId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        product_name: '',
        quantity: 1,
        selling_price: '',
        cost_price: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const { error } = await supabase.from('sales').insert([{
                shop_id: shopId,
                product_name: formData.product_name,
                quantity: parseInt(formData.quantity, 10) || 1,
                selling_price: parseFloat(formData.selling_price) || 0,
                cost_price: parseFloat(formData.cost_price) || 0
            }]);

            if (error) throw error;

            setSuccess(true);
            setFormData({
                product_name: '',
                quantity: 1,
                selling_price: '',
                cost_price: ''
            });

            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            console.error('Error adding sale:', err.message);
            alert('Failed to record sale: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Record Sale</h1>
                <p className="text-slate-500 mt-2">Enter the details of the new transaction below.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center">
                            <PackageSearch className="w-4 h-4 mr-2 text-blue-500" />
                            Product Name *
                        </label>
                        <input
                            required
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleChange}
                            placeholder="e.g. Premium Coffee Beans"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center">
                                <Tag className="w-4 h-4 mr-2 text-blue-500" />
                                Quantity *
                            </label>
                            <input
                                required
                                type="number"
                                min="1"
                                step="1"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center">
                                <Receipt className="w-4 h-4 mr-2 text-emerald-500" />
                                Selling Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="selling_price"
                                    value={formData.selling_price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full p-4 pl-8 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center">
                                <Wallet className="w-4 h-4 mr-2 text-slate-400" />
                                Cost Price (Optional)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="cost_price"
                                    value={formData.cost_price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full p-4 pl-8 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Used to automatically calculate total profit.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-8 flex items-center justify-between transition-all">
                        <div className="text-lg font-bold text-slate-800">
                            Total: ${((parseFloat(formData.selling_price) || 0) * (parseInt(formData.quantity, 10) || 1)).toFixed(2)}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-4 rounded-xl transition-all flex items-center font-semibold text-white shadow-lg active:scale-95 disabled:opacity-70 ${success ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                }`}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                            ) : success ? (
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                            ) : (
                                <Plus className="w-5 h-5 mr-2" />
                            )}
                            {success ? 'Recorded!' : 'Complete Sale'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
