export type Page = 'landing' | 'dashboard' | 'auth' | 'services' | 'service-detail' | 'about' | 'contact' | 'privacy' | 'terms' | 'deletion' | 'success-stories' | 'artists';

export interface Service {
 id: string;
 title: string;
 description: string;
 icon?: any;
}

export type UserRole = 'admin' | 'manager' | 'user';
export type User = any;
