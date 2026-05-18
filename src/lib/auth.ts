import type { User, Session } from '@/types';
import { apiFetch } from './api';

const SESSION_KEY = 'iaf_training_session';

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response && response.token) {
      const session: Session & { token: string; refresh_token?: string } = {
        user: response.user,
        isAuthenticated: true,
        token: response.token,
        refresh_token: (response as any).refresh_token,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, user: response.user };
    }

    return { success: false, error: 'Invalid response from server' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Login failed' };
  }
}

// ── Demo / offline login ────────────────────────────────────────────
// Creates a fully client-side session so the four demo personas can be
// entered with one click without the backend being reachable. Real form
// login (above) still hits the API normally.
export type DemoRole = 'trainee' | 'instructor' | 'evaluator' | 'admin';

const nowIso = () =>
  typeof window !== 'undefined' ? new Date().toISOString() : '2026-01-01T00:00:00Z';

const DEMO_USERS: Record<DemoRole, User> = {
  trainee: {
    id: 'demo-trainee',
    name: 'Flt Lt. Arjun',
    email: 'trainee@demo.aegis',
    role: 'trainee',
    rank: 'Flight Lieutenant',
    squadron: 'No. 1 Squadron',
    base: 'Ambala AFS',
    joinedAt: '2024-01-15',
    lastActive: nowIso(),
  },
  instructor: {
    id: 'demo-instructor',
    name: 'Wing Cdr. Sharma',
    email: 'instructor@demo.aegis',
    role: 'instructor',
    rank: 'Wing Commander',
    squadron: 'Training Wing',
    base: 'Ambala AFS',
    joinedAt: '2020-06-01',
    lastActive: nowIso(),
  },
  evaluator: {
    id: 'demo-evaluator',
    name: 'Sqn Ldr. Patel',
    email: 'evaluator@demo.aegis',
    // Evaluators operate inside the instructor workspace.
    role: 'instructor',
    rank: 'Squadron Leader',
    squadron: 'Standards & Evaluation',
    base: 'Ambala AFS',
    joinedAt: '2021-09-10',
    lastActive: nowIso(),
  },
  admin: {
    id: 'demo-admin',
    name: 'Platform Admin',
    email: 'admin@demo.aegis',
    role: 'admin',
    rank: 'Administrator',
    squadron: 'HQ',
    base: 'Air HQ',
    joinedAt: '2019-01-01',
    lastActive: nowIso(),
  },
};

export function loginDemo(role: DemoRole): User {
  const user = DEMO_USERS[role];
  const session = {
    user,
    isAuthenticated: true,
    token: `demo.${role}.token`,
    refresh_token: `demo.${role}.refresh`,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return user;
}

export async function logout(): Promise<void> {
  const session = getSession();
  if (session && (session as any).refresh_token) {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: (session as any).refresh_token }),
      });
    } catch {
      // best-effort — clear local state regardless
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

let cachedSession: Session | null = null;
let cachedRawSession: string | null = null;

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;

  const rawSession = localStorage.getItem(SESSION_KEY);
  if (!rawSession) {
    cachedSession = null;
    cachedRawSession = null;
    return null;
  }

  if (rawSession === cachedRawSession) {
    return cachedSession;
  }

  try {
    cachedSession = JSON.parse(rawSession) as Session;
    cachedRawSession = rawSession;
    return cachedSession;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const session = getSession();
  return session?.isAuthenticated ?? false;
}

export function getCurrentUser(): User | null {
  const session = getSession();
  return session?.user ?? null;
}

export function hasRole(role: User['role'] | User['role'][]): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

export function requireAuth(): User | null {
  const user = getCurrentUser();
  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }
  return user;
}

export function requireRole(role: User['role'] | User['role'][]): User | null {
  const user = requireAuth();
  if (!user) return null;

  if (!hasRole(role)) {
    if (typeof window !== 'undefined') window.location.href = '/unauthorized';
    return null;
  }

  return user;
}

export interface MeResponse {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  permissions: string[];
}

export async function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/auth/me');
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}
