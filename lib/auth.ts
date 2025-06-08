// Simple authentication system for demo purposes
// In production, use NextAuth.js or similar

export interface User {
  id: string;
  email: string;
  name: string;
}

const ADMIN_CREDENTIALS = {
  email: 'admin@portfolio.com',
  password: 'admin123'
};

export function authenticateUser(email: string, password: string): User | null {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    return {
      id: '1',
      email: ADMIN_CREDENTIALS.email,
      name: 'Portfolio Admin'
    };
  }
  return null;
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('admin_user');
  return userData ? JSON.parse(userData) : null;
}

export function storeUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_user', JSON.stringify(user));
}

export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_user');
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null;
}