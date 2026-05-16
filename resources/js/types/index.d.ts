export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    is_admin?: boolean;
    theme_preference?: 'light' | 'dark' | 'system';
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    /** Logged-in user theme (refreshed each request). */
    appearance?: 'light' | 'dark' | 'system' | null;
};
