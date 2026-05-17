import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthContextType } from '../../types/auth/AuthContext';
import type { AuthUser } from '../../types/auth/AuthUser';
import { ObrisiVrednostPoKljucu, procitajVrednostPoKljucu, SacuvajVrednostPoKljucu } from '../../helpers/local_storage';
import type { JwtTokenClaims } from '../../types/auth/JwtTokenClaims';
import axios from "axios";
import { usersApi } from '../../api_services/users/UsersAPIService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJWT = (token: string): JwtTokenClaims | null => {
    try {
        const decoded = jwtDecode<JwtTokenClaims>(token);
        
        if (decoded.id && decoded.username && decoded.role) {
            return {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role,
            };
        }
        
        return null;
    } catch (error) {
        console.error('Greška pri dekodiranju JWT tokena:', error);
        return null;
    }
};

const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        return decoded.exp ? decoded.exp < currentTime : false;
    } catch {
        return true;
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = procitajVrednostPoKljucu("authToken");
            
            if (savedToken) {
                if (isTokenExpired(savedToken)) {
                    ObrisiVrednostPoKljucu("authToken");
                    setIsLoading(false);
                    return;
                }
                
                const claims = decodeJWT(savedToken);
                if (claims) {
                    setToken(savedToken);
                    
                    setUser({
                        id: claims.id,
                        username: claims.username,
                        role: claims.role
                    });

                    try {
                        const fullUser = await usersApi.getMe(savedToken);
                        if (fullUser) {
                            setUser({
                                id: fullUser.id,
                                username: fullUser.korisnickoIme,
                                role: fullUser.uloga,
                                profile_picture: fullUser.profile_image || "" 
                            });
                        }
                    } catch (err) {
                        console.error("Problem sa učitavanjem profila:", err);
                    }
                } else {
                    ObrisiVrednostPoKljucu("authToken");
                }
            }
            
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (newToken: string) => {
        const claims = decodeJWT(newToken);
        
        if (claims && !isTokenExpired(newToken)) {
            setToken(newToken);
            SacuvajVrednostPoKljucu("authToken", newToken);
            
            setUser({
                id: claims.id,
                username: claims.username,
                role: claims.role,
            });

            const fullUser = await usersApi.getMe(newToken);
            if (fullUser) {
                setUser({
                    id: fullUser.id,
                    username: fullUser.korisnickoIme,
                    role: fullUser.uloga,
                    profile_picture: fullUser.profile_image || ""
                });
            }
        } else {
            console.error('Nevažeći ili istekao token');
        }
    };

    const logout = async () => {
        try {
            const currentToken = procitajVrednostPoKljucu("authToken");
                
            if (currentToken) {
                await axios.post(`${import.meta.env.VITE_API_URL}auth/logout`, {}, {
                    headers: { Authorization: `Bearer ${currentToken}` }
                });
            }
        } catch (error) {
            console.error("Greška pri odjavi na serveru", error);
        }

        setToken(null);
        setUser(null);
        ObrisiVrednostPoKljucu("authToken");
    };

    const isAuthenticated = !!user && !!token;

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;