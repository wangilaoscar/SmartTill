import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { format } from 'date-fns';
import { History, Search } from 'lucide-react';

export default function SalesHistory() {
    const { shopId } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!shopId) return;
        fetchSales();

        const channel = supabase
            .channel('sales_history_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sales', filter: `shop_id=eq.${shopId}` }, (payload) => {
                setSales(current => [payload.new, ...current]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [shopId]);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('shop_id', shopId)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setSales(data || []);
        } catch (err) {
            console.error('Error fetching sales history:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(sale =>
        sale.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                        <History className="w-8 h-8 mr-3 text-blue-600" />
                        Sales History
                    </h1>
                    <p className="text-slate-500 mt-2">View and search your recent transactions.</p>
                </div>

                <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 w-full md:w-72 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-sm">
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4 text-right">Qty</th>
                                <th className="px-6 py-4 text-right">Price</th>
                                <th className="px-6 py-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="ml-3">Loading history...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                                            <History className="w-10 h-10 text-slate-300" />
                                        </div>
                                        No sales found
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 flex items-center">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {sale.product_name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-800">{sale.product_name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                            {format(new Date(sale.created_at), 'MMM d, yyyy · h:mm a')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {sale.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-600">
                                            ${sale.selling_price?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                            ${sale.total?.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
