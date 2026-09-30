import React from "react";
import ApiClient from "./apiClient";

type User = {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    cityId: number;
};

type Auth = {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = React.createContext<Auth | null>(null);

type AuthProviderProps = {
    children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    const client = ApiClient()
    const refreshUser = async () => {
        try {
            const { data } = await client.get("/auth/unique");
            setUser(data.user);
        } catch (error) {
            setUser(null);
        }
    };

    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                await refreshUser();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await client.post("/auth/logout");
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user , loading , refreshUser , logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;