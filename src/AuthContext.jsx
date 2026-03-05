import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [role, setRole] = useState(localStorage.getItem('smarttill_role') || null);

    const login = (selectedRole) => {
        setRole(selectedRole);
        localStorage.setItem('smarttill_role', selectedRole);
    };

    const logout = () => {
        setRole(null);
        localStorage.removeItem('smarttill_role');
    };

    return (
        <AuthContext.Provider value={{ role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
