import { UserRole } from "@headless/types";
export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
}
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
export declare function signAccessToken(payload: TokenPayload, rememberMe?: boolean): string;
export declare function signRefreshToken(payload: TokenPayload, rememberMe?: boolean): string;
export declare function verifyAccessToken(token: string): TokenPayload | null;
export declare function verifyRefreshToken(token: string): TokenPayload | null;
export declare function hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean;
//# sourceMappingURL=index.d.ts.map