import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EmployeesService } from '../../employees.service';
import { AuthService } from '../../auth.service';
import { getAuth, sendSignInLinkToEmail } from 'firebase/auth';
import { actionCodeSettings } from '../../../environments/firebase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="scene">
      <div class="bg">
        <div class="blob b1"></div>
        <div class="blob b2"></div>
      </div>
      <div class="login-wrap">
        <mat-card appearance="outlined" class="glass">
          <mat-card-header>
            <mat-card-title>Welcome</mat-card-title>
            <mat-card-subtitle>Select mode & sign in</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="modes">
              <button mat-stroked-button color="primary" [class.active]="mode() === 'employee'" (click)="setMode('employee')">User Mode</button>
              <button mat-stroked-button color="accent" [class.active]="mode() === 'admin'" (click)="setMode('admin')">Advanced (Admin)</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="submit()" class="form">
              <mat-form-field appearance="outline" class="field">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username" required>
                <mat-hint *ngIf="form.controls['username'].invalid && form.controls['username'].touched">Username is required</mat-hint>
              </mat-form-field>
              <ng-container *ngIf="mode() === 'employee'">
                <mat-form-field appearance="outline" class="field">
                  <mat-label>Full name</mat-label>
                  <input matInput formControlName="name">
                  <mat-hint *ngIf="form.controls['name'].invalid && form.controls['name'].touched">Name is required</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="field">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email">
                  <mat-hint *ngIf="form.controls['email'].invalid && form.controls['email'].touched">Valid email is required</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="field">
                  <mat-label>Profession</mat-label>
                  <input matInput formControlName="profession" placeholder="e.g. Engineer">
                  <mat-hint *ngIf="form.controls['profession'].invalid && form.controls['profession'].touched">Profession is required</mat-hint>
                </mat-form-field>
              </ng-container>
              <mat-form-field appearance="outline" class="field">
                <mat-label>Password</mat-label>
                <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" (keyup)="onPasswordKey($event)" required>
                <button mat-icon-button matSuffix type="button" (click)="toggleShowPassword()" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                  <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-hint *ngIf="capsLock()" class="warn">Caps Lock is ON</mat-hint>
                <mat-hint *ngIf="form.controls['password'].invalid && form.controls['password'].touched">Password is required</mat-hint>
              </mat-form-field>
              <!-- Strength meter -->
              <div class="strength" *ngIf="form.controls['password'].value as pw">
                <div class="bar" [class.on]="strength()>=1"></div>
                <div class="bar" [class.on]="strength()>=2"></div>
                <div class="bar" [class.on]="strength()>=3"></div>
                <div class="bar" [class.on]="strength()>=4"></div>
                <span class="label">{{ strengthLabel() }}</span>
              </div>
              <mat-form-field *ngIf="mode() === 'admin'" appearance="outline" class="field">
                <mat-label>Admin PIN</mat-label>
                <input matInput type="password" formControlName="adminPin" placeholder="e.g. 1234">
                <mat-hint>Required in Advanced mode (demo PIN: 1234)</mat-hint>
              </mat-form-field>
              <div class="error" *ngIf="error()">{{ error() }}</div>
              <div class="actions">
                <mat-checkbox formControlName="remember">Remember me</mat-checkbox>
                <span class="flex-spacer"></span>
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || cooldown() > 0">{{ cooldown() > 0 ? 'Retry in ' + cooldown() + 's' : 'Continue' }}</button>
                <button *ngIf="mode() === 'employee'" mat-stroked-button color="primary" type="button" (click)="sendMagicLink()">Send verification link</button>
              </div>
              <div class="hints">
                <span>Tip: Press Enter to submit, Esc to cancel, Ctrl+1 User / Ctrl+2 Admin</span>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .scene { position: relative; height: 100vh; overflow: hidden; background: radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,.15), transparent), radial-gradient(1200px 600px at 80% 90%, rgba(34,197,94,.15), transparent), linear-gradient(180deg, #0ea5e933, transparent); }
    .bg { position: absolute; inset: 0; filter: blur(40px); pointer-events: none; }
    .blob { position: absolute; width: 520px; height: 520px; border-radius: 50%; opacity: .25; animation: float 14s ease-in-out infinite; }
    .b1 { background: #6366f1; top: -120px; left: -120px; }
    .b2 { background: #22c55e; bottom: -120px; right: -120px; animation-delay: -7s; }
    @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-30px) } }
    .login-wrap { position: relative; display: grid; place-items: center; height: 100%; padding: 2rem; }
    .glass { backdrop-filter: blur(10px); background: rgba(255,255,255,.65); box-shadow: 0 20px 60px rgba(0,0,0,.15); }
    .modes { display: flex; gap: .5rem; margin-bottom: .75rem; }
    .modes .active { border-color: currentColor; box-shadow: inset 0 0 0 1px currentColor; }
    .form { display: grid; gap: 1rem; min-width: 280px; }
    .field { width: 320px; max-width: 90vw; }
    .actions { display: flex; align-items: center; gap: .5rem; }
    .warn { color: #b45309; }
    .error { color: #b91c1c; font-size: .9rem; }
    .strength { display: flex; align-items: center; gap: .25rem; margin: -.5rem 0 .25rem; }
    .strength .bar { width: 40px; height: 6px; border-radius: 6px; background: #e5e7eb; transition: background .2s ease; }
    .strength .bar.on:nth-child(1) { background: #ef4444; }
    .strength .bar.on:nth-child(2) { background: #f59e0b; }
    .strength .bar.on:nth-child(3) { background: #10b981; }
    .strength .bar.on:nth-child(4) { background: #0ea5e9; }
    .strength .label { font-size: .8rem; opacity: .75; margin-left: .25rem; }
    .flex-spacer { flex: 1 1 auto; }
    .hints { font-size: .8rem; opacity: .7; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  mode = signal<'admin'|'employee'>(localStorage.getItem('auth.mode') === 'employee' ? 'employee' : 'admin');
  showPassword = signal<boolean>(false);
  capsLock = signal<boolean>(false);
  error = signal<string>('');
  strength = signal<number>(0);
  private fails = 0;
  cooldown = signal<number>(0);
  private cooldownTimer?: any;

  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly router: Router, private readonly employees: EmployeesService, private readonly snack: MatSnackBar) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      adminPin: [''],
      // extra fields for user mode
      name: [''],
      email: [''],
      profession: [''],
      remember: [localStorage.getItem('login.remember') === '1']
    });
    // Apply validators according to initial mode (default admin)
    this.applyModeValidators(this.mode());
    // Prefill remembered values
    if (this.form.controls['remember'].value) {
      const rememberedUsername = localStorage.getItem('login.username') || '';
      const rememberedEmail = localStorage.getItem('login.email') || '';
      if (rememberedUsername) this.form.controls['username'].setValue(rememberedUsername);
      if (rememberedEmail) this.form.controls['email'].setValue(rememberedEmail);
    }
    // Strength meter subscribe
    this.form.controls['password'].valueChanges.subscribe((pw: string) => {
      this.strength.set(this.computeStrength(pw || ''));
    });
  }

  setMode(m: 'admin'|'employee') {
    this.mode.set(m);
    localStorage.setItem('auth.mode', m);
    this.applyModeValidators(m);
  }
  private applyModeValidators(m: 'admin'|'employee') {
    const name = this.form.controls['name'];
    const email = this.form.controls['email'];
    const profession = this.form.controls['profession'];
    if (m === 'employee') {
      name.setValidators([Validators.required]);
      email.setValidators([Validators.required, Validators.email]);
      profession.setValidators([Validators.required]);
    } else {
      name.clearValidators();
      email.clearValidators();
      profession.clearValidators();
      name.setValue(name.value || '');
      email.setValue(email.value || '');
      profession.setValue(profession.value || '');
    }
    name.updateValueAndValidity();
    email.updateValueAndValidity();
    profession.updateValueAndValidity();
  }
  toggleShowPassword() { this.showPassword.update(v => !v); }
  onPasswordKey(e: KeyboardEvent) { this.capsLock.set(e.getModifierState && e.getModifierState('CapsLock')); }
  strengthLabel() {
    const s = this.strength();
    return s <= 1 ? 'Weak' : s === 2 ? 'Fair' : s === 3 ? 'Good' : 'Strong';
  }
  private computeStrength(pw: string) {
    let s = 0;
    if (pw.length >= 6) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 10) s++;
    return Math.min(4, s);
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent) {
    // Only allow mode switching with Ctrl/Cmd to avoid toggling while typing PIN
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key === '1') { e.preventDefault(); this.setMode('employee'); }
    if (mod && e.key === '2') { e.preventDefault(); this.setMode('admin'); }
    if (e.key === 'Enter' && !this.form.invalid && this.cooldown() === 0) this.submit();
  }

  submit() {
    this.error.set('');
    if (this.mode() === 'admin') {
      const pin = this.form.controls['adminPin'].value as string;
      if (!pin || pin !== '1234') {
        this.onFail('Invalid admin PIN');
        return;
      }
    }
    const { username, password } = this.form.getRawValue();
    const role = this.mode();
    localStorage.setItem('auth.mode', role);
    const profile = role === 'employee' ? {
      name: this.form.controls['name'].value as string,
      email: this.form.controls['email'].value as string,
      profession: this.form.controls['profession'].value as string,
    } : undefined;
    if (role === 'employee' && (!profile!.name || !profile!.email || !profile!.profession || this.form.controls['email'].invalid)) {
      this.onFail('Please fill name, valid email, and profession');
      return;
    }
    if (this.auth.login(username!, password!, role, profile as any)) {
      // remember me
      if (this.form.controls['remember'].value) {
        localStorage.setItem('login.remember', '1');
        localStorage.setItem('login.username', String(username || ''));
        if (profile?.email) localStorage.setItem('login.email', String(profile.email));
      } else {
        localStorage.removeItem('login.remember');
        localStorage.removeItem('login.username');
        localStorage.removeItem('login.email');
      }
      // If employee, ensure they exist in Employees roster
      if (role === 'employee' && profile) {
        this.employees.addOrGet({ name: profile.name, email: profile.email, profession: profile.profession });
        // Persist to backend (MySQL upsert)
        fetch('http://localhost:8080/api/users/upsert', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            name: profile.name,
            email: profile.email,
            profession: profile.profession
          })
        }).catch(() => {});
      }
      // After login, route by role
      if (role === 'admin') this.router.navigateByUrl('/dashboard');
      else this.router.navigateByUrl('/events');
      this.fails = 0; this.cooldown.set(0); if (this.cooldownTimer) { clearInterval(this.cooldownTimer); this.cooldownTimer = undefined; }
    } else {
      this.onFail('Login failed');
    }
  }

  private onFail(msg: string) {
    this.error.set(msg);
    this.fails++;
    if (this.fails >= 3 && this.cooldown() === 0) {
      let left = 10;
      this.cooldown.set(left);
      this.cooldownTimer = setInterval(() => {
        left -= 1; this.cooldown.set(left);
        if (left <= 0) { clearInterval(this.cooldownTimer); this.cooldownTimer = undefined; this.cooldown.set(0); this.fails = 0; }
      }, 1000);
    }
  }

  async sendMagicLink() {
    try {
      if (this.mode() !== 'employee') return;
      const emailCtrl = this.form.controls['email'];
      const nameCtrl = this.form.controls['name'];
      const usernameCtrl = this.form.controls['username'];
      const professionCtrl = this.form.controls['profession'];
      emailCtrl.markAsTouched();
      if (emailCtrl.invalid) { this.error.set('Enter a valid email first'); return; }
      const email = String(emailCtrl.value || '').trim();
      const auth = getAuth();
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('pendingEmail', email);
      if (nameCtrl.value) window.localStorage.setItem('pendingName', String(nameCtrl.value));
      if (usernameCtrl.value) window.localStorage.setItem('pendingUsername', String(usernameCtrl.value));
      if (professionCtrl.value) window.localStorage.setItem('pendingProfession', String(professionCtrl.value));
      this.error.set('');
      this.snack.open('Verification link sent. Check your email.', 'OK', { duration: 3000 });
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to send link');
    }
  }
}
