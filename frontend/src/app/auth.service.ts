import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'auth.loggedIn';
  readonly loggedIn = signal<boolean>(false);
  readonly userId = signal<number | null>(null);
  readonly role = signal<'admin' | 'employee' | null>(null);
  readonly profile = signal<{ name: string; email: string; profession: string } | null>(null);
  readonly verified = signal<boolean>(false);

  constructor() {
    this.loggedIn.set(localStorage.getItem(this.key) === '1');
    const uid = localStorage.getItem('auth.userId');
    const role = localStorage.getItem('auth.role') as 'admin' | 'employee' | null;
    this.userId.set(uid ? Number(uid) : null);
    this.role.set(role ?? null);
    this.verified.set(localStorage.getItem('auth.verified') === '1');
    try {
      const raw = localStorage.getItem('auth.profile');
      this.profile.set(raw ? JSON.parse(raw) : null);
    } catch { this.profile.set(null); }
  }

  login(
    username: string,
    password: string,
    role?: 'admin' | 'employee',
    profile?: { name: string; email: string; profession: string }
  ): boolean {
    // Demo-only auth: accepts any non-empty username/password
    const ok = !!username && !!password;
    if (ok) {
      this.loggedIn.set(true);
      localStorage.setItem(this.key, '1');
      // Role assignment: REQUIRE explicit role from caller. Do NOT infer from username.
      const isAdmin = role === 'admin';
      const assignedUserId = isAdmin ? 0 : 1; // mock employee id 1 for non-admin
      this.userId.set(assignedUserId);
      this.role.set(isAdmin ? 'admin' : 'employee');
      localStorage.setItem('auth.userId', String(assignedUserId));
      localStorage.setItem('auth.role', isAdmin ? 'admin' : 'employee');
      if (!isAdmin && profile) {
        this.profile.set({ name: profile.name, email: profile.email, profession: profile.profession });
        localStorage.setItem('auth.profile', JSON.stringify(this.profile()));
        this.verified.set(true);
        localStorage.setItem('auth.verified', '1');
      }
    }
    return ok;
  }

  // Complete login after Firebase email-link verification
  loginWithEmail(profile: { name?: string; email: string; profession?: string }) {
    this.loggedIn.set(true);
    localStorage.setItem(this.key, '1');
    this.userId.set(1); // mock employee id
    this.role.set('employee');
    localStorage.setItem('auth.userId', '1');
    localStorage.setItem('auth.role', 'employee');
    this.profile.set({ name: profile.name || '', email: profile.email, profession: profile.profession || '' });
    localStorage.setItem('auth.profile', JSON.stringify(this.profile()));
    this.verified.set(true);
    localStorage.setItem('auth.verified', '1');
  }

  logout() {
    this.loggedIn.set(false);
    this.userId.set(null);
    this.role.set(null);
    this.profile.set(null);
    this.verified.set(false);
    localStorage.removeItem(this.key);
    localStorage.removeItem('auth.userId');
    localStorage.removeItem('auth.role');
    localStorage.removeItem('auth.profile');
    localStorage.removeItem('auth.verified');
  }

  isAdmin() { return this.role() === 'admin'; }
  isEmployee() { return this.role() === 'employee'; }
  isVerified() { return this.verified(); }
}
