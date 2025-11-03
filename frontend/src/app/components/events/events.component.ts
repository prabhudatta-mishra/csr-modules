import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventsService } from '../../events.service';
import { AuthService } from '../../auth.service';
import { ProjectsService, Project } from '../../projects.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="section">
      <h2>Projects</h2>
      <div class="tools">
        <mat-form-field appearance="outline">
          <mat-label>Search projects</mat-label>
          <input matInput [(ngModel)]="q" (ngModelChange)="apply()" placeholder="name or department" />
        </mat-form-field>
      </div>

      <ng-container *ngIf="loading; else gridBlock">
        <div class="grid">
          <mat-card appearance="outlined" *ngFor="let i of [1,2,3,4]">
            <div class="sk-title"></div>
            <div class="sk-sub"></div>
            <div class="sk-line"></div>
            <div class="actions"><span class="sk-btn"></span></div>
          </mat-card>
        </div>
      </ng-container>
      <ng-template #gridBlock>
        <ng-container *ngIf="shown.length; else emptyState">
          <div class="grid">
            <mat-card appearance="outlined" *ngFor="let p of shown">
              <mat-card-header>
                <mat-card-title>{{ p.projectName }}</mat-card-title>
                <mat-card-subtitle>{{ p.department }} • {{ p.status }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>Seats available: {{ p.seats ?? 0 }}</p>
              </mat-card-content>
              <div class="actions">
                <button mat-raised-button color="primary" (click)="book(p)" [disabled]="(p.seats ?? 0) <= 0">Book</button>
              </div>
            </mat-card>
          </div>
        </ng-container>
        <ng-template #emptyState>
          <div class="empty">
            <h3>No projects to book</h3>
            <p>Try clearing filters or check back later.</p>
          </div>
        </ng-template>
      </ng-template>

      <ng-container *ngIf="auth.isAdmin()">
        <h3>Recent Bookings</h3>
        <div class="grid">
          <mat-card appearance="outlined" *ngFor="let b of bookings()">
            <mat-card-content>
              <div><strong>Project:</strong> {{ projectTitle(b.eventId) }}</div>
              <div><strong>User:</strong> {{ b.name || 'Unknown' }} <span *ngIf="b.email">({{ b.email }})</span></div>
              <div><strong>Profession:</strong> {{ b.profession || '-' }}</div>
              <div><strong>Time:</strong> {{ b.date | date:'short' }}</div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .section { padding: 1rem; display: grid; gap: 1rem; }
    .tools { display: flex; gap: .5rem; flex-wrap: wrap; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: .75rem; }
    @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
    .actions { padding: .5rem; display: flex; justify-content: flex-end; }
    /* Skeleton */
    .sk-title { height: 18px; width: 60%; border-radius: 6px; margin: 16px; background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.10) 37%, rgba(0,0,0,.06) 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; }
    .sk-sub { height: 14px; width: 40%; border-radius: 6px; margin: 0 16px 12px; background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.10) 37%, rgba(0,0,0,.06) 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; }
    .sk-line { height: 12px; width: 50%; border-radius: 6px; margin: 8px 16px 16px; background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.10) 37%, rgba(0,0,0,.06) 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; }
    .sk-btn { display: inline-block; height: 36px; width: 96px; border-radius: 10px; background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.10) 37%, rgba(0,0,0,.06) 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; }
    @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
    .empty { text-align: center; padding: 24px 8px; color: #334155; }
  `]
})
export class EventsComponent {
  q = '';
  shown: Project[] = [];
  loading = true;

  constructor(private readonly snack: MatSnackBar, private readonly svc: EventsService, private readonly projects: ProjectsService, public readonly auth: AuthService) {
    this.shown = this.projects.list();
    setTimeout(() => { this.loading = false; }, 350);
  }

  apply() {
    const q = this.q.trim().toLowerCase();
    const all = this.projects.list();
    this.shown = all.filter(p => !q || (p.projectName || '').toLowerCase().includes(q) || (p.department || '').toLowerCase().includes(q));
  }

  book(p: Project) {
    if ((p.seats ?? 0) <= 0) return;
    const res = this.svc.bookProject(p.id);
    if (res.ok) {
      this.snack.open('Booked successfully', 'OK', { duration: 2000 });
      this.apply();
    } else {
      this.snack.open(res.message || 'Booking failed', 'Dismiss', { duration: 2500 });
    }
  }

  bookings = () => this.svc.listBookings();
  projectTitle = (id: number) => this.projects.list().find(x => x.id === id)?.projectName || `#${id}`;
}
