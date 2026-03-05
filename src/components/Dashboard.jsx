import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, DollarSign, ShoppingCart, Package, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        profit: 0,
        transactions: 0,
        topProduct: 'N/A',
        slowProduct: 'N/A'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();

        const channel = supabase
            .channel('dashboard_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
                fetchStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchStats = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .gte('created_at', today.toISOString());

            if (error) throw error;

            let revenue = 0;
            let profit = 0;
            let transactions = data.length;

            const productCounts = {};

            data.forEach(sale => {
                revenue += parseFloat(sale.total) || 0;
                profit += parseFloat(sale.profit) || 0;

                if (!productCounts[sale.product_name]) {
                    productCounts[sale.product_name] = 0;
                }
                productCounts[sale.product_name] += sale.quantity;
            });

            let topProduct = 'N/A';
            let slowProduct = 'N/A';

            let maxQty = -1;
            let minQty = Infinity;

            Object.entries(productCounts).forEach(([name, qty]) => {
                if (qty > maxQty) {
                    maxQty = qty;
                    topProduct = name;
                }
                if (qty < minQty) {
                    minQty = qty;
                    slowProduct = name;
                }
            });

            if (transactions === 0) {
                slowProduct = 'N/A';
                topProduct = 'N/A';
            }

            setStats({
                revenue,
                profit,
                transactions,
                topProduct,
                slowProduct
            });

        } catch (err) {
            console.error('Error fetching dashboard stats:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium">{title}</h3>
                <div className={`p-3 rounded-2xl ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div>
                <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
                {subtitle && <div className="text-sm text-slate-400 font-medium">{subtitle}</div>}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Today's Overview</h1>
                    <p className="text-slate-500 mt-2">Live transaction monitoring for {format(new Date(), 'MMMM d, yyyy')}</p>
                </div>
                {loading && (
                    <div className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-full text-sm font-semibold max-sm:hidden">
                        <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                        Syncing
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.revenue.toFixed(2)}`}
                    icon={DollarSign}
                    colorClass="bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                    subtitle="Today's combined sales"
                />
                <StatCard
                    title="Net Profit"
                    value={`$${stats.profit.toFixed(2)}`}
                    icon={TrendingUp}
                    colorClass="bg-blue-100 text-blue-600"
                    subtitle="Estimated profit"
                />
                <StatCard
                    title="Transactions"
                    value={stats.transactions}
                    icon={ShoppingCart}
                    colorClass="bg-purple-100 text-purple-600"
                    subtitle="Successful checkouts"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 flex items-start space-x-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125 duration-500"></div>
                    <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl relative z-10">
                        <Package className="w-8 h-8" />
                    </div>
                    <div className="relative z-10 w-full">
                        <h3 className="text-emerald-800 font-semibold mb-1">Top Selling Product</h3>
                        <p className="text-2xl font-bold text-slate-900 truncate" title={stats.topProduct}>{stats.topProduct}</p>
                        <p className="text-emerald-600 text-sm font-medium mt-1">Driving most volume today</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 flex items-start space-x-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125 duration-500"></div>
                    <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl relative z-10">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="relative z-10 w-full">
                        <h3 className="text-amber-800 font-semibold mb-1">Slowest Moving Product</h3>
                        <p className="text-2xl font-bold text-slate-900 truncate" title={stats.slowProduct}>{stats.slowProduct}</p>
                        <p className="text-amber-600 text-sm font-medium mt-1">Consider promotions to clear</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
