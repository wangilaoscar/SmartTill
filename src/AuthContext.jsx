import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [role, setRole] = useState(null);
    const [shopId, setShopId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchRoleAndShop(session.user.id);
            else setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchRoleAndShop(session.user.id);
            } else {
                setRole(null);
                setShopId(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchRoleAndShop = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role, shop_id')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 means zero rows, not necessarily an error if they haven't set up yet
                console.error("Error fetching role:", error);
            }

            if (data) {
                setRole(data.role);
                setShopId(data.shop_id);
            } else {
                setRole(null);
                setShopId(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, role, shopId, loading, logout, setRole, setShopId }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
