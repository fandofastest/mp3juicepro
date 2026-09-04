import React from "react";
interface AuthContextType {
    user: any | null;
    token: string | null;
    login: (userData: any, token: string) => void;
    logout: () => void;
    isLoading: boolean;
}
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare function useAuth(): AuthContextType;
export default function Providers({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export {};
//# sourceMappingURL=providers.d.ts.map