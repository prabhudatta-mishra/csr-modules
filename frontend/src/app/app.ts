import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommandPaletteComponent } from './components/shared/command-palette.component';
import { NotificationPanelComponent } from './components/shared/notification-panel.component';
import { NotificationService } from './notification.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatDialogModule,
  ],
  template: `
    <mat-sidenav-container class="layout">
      <mat-sidenav #sidenav mode="side" [opened]="true" class="sidenav">
        <div class="brand">CSR Module</div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active"><mat-icon fontSet="material-icons" fontIcon="dashboard"></mat-icon><span>Dashboard</span></a>
          <a mat-list-item routerLink="/projects" routerLinkActive="active"><mat-icon fontSet="material-icons" fontIcon="work"></mat-icon><span>Projects</span></a>
          <a mat-list-item routerLink="/projects/board" routerLinkActive="active"><mat-icon fontSet="material-icons" fontIcon="view_kanban"></mat-icon><span>Projects Board</span></a>
          <a mat-list-item routerLink="/projects/grid" routerLinkActive="active"><mat-icon fontSet="material-icons" fontIcon="grid_view"></mat-icon><span>Projects Grid</span></a>
          <a mat-list-item routerLink="/employees" routerLinkActive="active"><mat-icon fontSet="material-icons" fontIcon="badge"></mat-icon><span>Employees</span></a>
          <a mat-list-item routerLink="/volunteers" routerLinkActive="active"><mat-icon fontSet="material-icons" fontIcon="volunteer_activism"></mat-icon><span>Volunteers</span></a>
          <a mat-list-item routerLink="/reports" routerLinkActive="active"><mat-icon fontSet="material-icons" fontIcon="bar_chart"></mat-icon><span>Reports</span></a>
          <a mat-list-item routerLink="/login" routerLinkActive="active"><mat-icon fontSet="material-icons" fontIcon="login"></mat-icon><span>Login</span></a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" class="toggle" aria-label="Toggle sidenav">
            <!-- Hamburger menu icon as inline SVG -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="3" y="6" width="18" height="2" rx="1"></rect>
              <rect x="3" y="11" width="18" height="2" rx="1"></rect>
              <rect x="3" y="16" width="18" height="2" rx="1"></rect>
            </svg>
          </button>
          <span>{{ title() }}</span>
          <button mat-icon-button [matMenuTriggerFor]="moreMenu" aria-label="More" style="margin-left:.25rem;">
            <!-- Three dots (kebab) icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="5.5" r="1.8"></circle>
              <circle cx="12" cy="12" r="1.8"></circle>
              <circle cx="12" cy="18.5" r="1.8"></circle>
            </svg>
          </button>
          <span class="spacer"></span>
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search projects</mat-label>
            <input matInput [(ngModel)]="search" (keyup.enter)="submitSearch()" placeholder="Type and press Enter" />
          </mat-form-field>
          <button mat-icon-button class="notif" (click)="openNotifications()" aria-label="Notifications">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 1 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-1.99 2A1 1 0 0 0 5 20h14a1 1 0 0 0 .99-1.17L18 16z"/>
            </svg>
            <span class="badge" *ngIf="notifications.unreadCount()">{{ notifications.unreadCount() }}</span>
          </button>
          <button mat-icon-button (click)="toggleTheme()" [attr.aria-label]="dark() ? 'Switch to light' : 'Switch to dark'">
            <ng-container *ngIf="dark(); else lightIcon">
              <!-- Moon icon -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </ng-container>
            <ng-template #lightIcon>
              <!-- Sun icon -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm7.04-3.95l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 11v2h3v-2h-3zM11 1v3h2V1h-2zM4.22 18.36l-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42zM17.24 4.84l1.42 1.42 1.79-1.8-1.41-1.41-1.8 1.79zM12 7a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7z"></path>
              </svg>
            </ng-template>
          </button>
          
          <mat-menu #moreMenu="matMenu">
            <button mat-menu-item (click)="openNotifications()">
              <span>Notifications</span>
            </button>
            <button mat-menu-item (click)="toggleTheme()">
              <span>Toggle theme</span>
            </button>
            <a mat-menu-item routerLink="/login">Login</a>
          </mat-menu>
        </mat-toolbar>

        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .layout { height: 100vh; }
    .toolbar { position: sticky; top: 0; z-index: 2; }
    .sidenav { width: 240px; }
    .brand { font-weight: 600; padding: 1rem; }
    .content { padding: 1rem; }
    a.active { background: rgba(0,0,0,0.06); }
    @media (max-width: 960px) { .sidenav { width: 200px; } }
    .spacer { flex: 1 1 auto; }
    .toolbar .notif { position: relative; }
    .toolbar .notif .badge { position: absolute; top: 0; right: 0; transform: translate(30%, -30%); background: #ef4444; color: white; border-radius: 9999px; font-size: 10px; padding: 0 6px; line-height: 16px; }
    .search-field { width: 280px; margin-right: .5rem; }
  `]
})
export class App {
  protected readonly title = signal('csr-module');
  protected readonly dark = signal<boolean>(false);
  protected search = '';

  constructor(private readonly dialog: MatDialog, public readonly notifications: NotificationService, private readonly router: Router) {
    const saved = localStorage.getItem('theme.dark') === '1';
    this.dark.set(saved);
    this.applyTheme();
    window.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      }
    });
  }

  toggleTheme() {
    this.dark.update(v => !v);
    localStorage.setItem('theme.dark', this.dark() ? '1' : '0');
    this.applyTheme();
  }

  private applyTheme() {
    const cls = 'dark-theme';
    if (this.dark()) document.body.classList.add(cls); else document.body.classList.remove(cls);
  }

  private openCommandPalette() {
    this.dialog.open(CommandPaletteComponent, {
      width: '640px',
      data: { toggleTheme: () => this.toggleTheme() }
    }).afterClosed().subscribe((result) => {
      if (result === 'add-project') {
        // Navigate to projects; the Projects page handles the dialog
      }
    });
  }

  openNotifications() {
    this.dialog.open(NotificationPanelComponent, { width: '620px' });
  }

  submitSearch() {
    const q = (this.search || '').trim();
    if (!q) return;
    this.router.navigate(['/projects'], { queryParams: { q } });
  }
}
