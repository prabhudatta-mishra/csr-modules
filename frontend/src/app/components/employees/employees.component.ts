import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VolunteerDialogComponent } from '../volunteers/volunteers-cards.component';
import { EmployeesService, Employee } from '../../employees.service';
import { ProjectsService, Project } from '../../projects.service';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="section">
      <div class="header">
        <h2>Employees & Volunteers</h2>
        <button mat-raised-button color="primary" (click)="addEmployee()">
          <mat-icon>person_add</mat-icon>
          Add Employee
        </button>
      </div>

      <mat-card appearance="outlined">
        <mat-card-content>
          <ng-container *ngIf="loading; else tableBlock">
            <div class="skeleton-table">
              <div class="row" *ngFor="let i of [1,2,3,4,5,6]">
                <span class="cell w-24"></span>
                <span class="cell w-40"></span>
                <span class="cell w-28"></span>
                <span class="cell w-32"></span>
              </div>
            </div>
          </ng-container>
          <ng-template #tableBlock>
            <ng-container *ngIf="dataSource.data.length; else emptyState">
          <div class="table-tools">
            <mat-form-field appearance="outline">
              <mat-label>Filter</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Search employees">
            </mat-form-field>
            <div class="import">
              <input type="file" accept=".csv" (change)="onFileSelected($event)">
              <button mat-stroked-button color="primary" (click)="importCsv()" [disabled]="!csvPreview.length">Import CSV ({{ csvPreview.length }})</button>
              <small *ngIf="csvError" class="err">{{ csvError }}</small>
            </div>
          </div>

          <table mat-table [dataSource]="dataSource" class="mat-elevation-z1">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let e">{{ e.name }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let e">{{ e.email }}</td>
            </ng-container>

            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let e">{{ e.department }}</td>
            </ng-container>

            <ng-container matColumnDef="assign">
              <th mat-header-cell *matHeaderCellDef>Assign to Project</th>
              <td mat-cell *matCellDef="let e">
                <mat-form-field appearance="outline" class="assign-field">
                  <mat-label>Project</mat-label>
                  <mat-select [(ngModel)]="selection[e.id]">
                    <mat-option *ngFor="let p of projects" [value]="p.id">{{ p.projectName }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-stroked-button color="primary" (click)="assign(e)">Assign</button>
              </td>
            </ng-container>

            <ng-container matColumnDef="assigned">
              <th mat-header-cell *matHeaderCellDef>Assigned Projects</th>
              <td mat-cell *matCellDef="let e">
                <span class="chips">
                  <span class="chip" *ngFor="let p of assigned(e)">
                    {{ p.projectName }}
                    <button mat-icon-button color="warn" (click)="unassign(e, p)" aria-label="Unassign">
                      <mat-icon>close</mat-icon>
                    </button>
                  </span>
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let e">
                <button mat-icon-button color="warn" (click)="remove(e)" aria-label="Delete employee">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
            </ng-container>
            <ng-template #emptyState>
              <div class="empty">
                <h3>No employees yet</h3>
                <p>Add employees manually or import from CSV.</p>
                <button mat-raised-button color="primary" (click)="addEmployee()">Add Employee</button>
              </div>
            </ng-template>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .section { padding: 1rem; display: grid; gap: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .table-tools { margin-bottom: .5rem; }
    .import { display: inline-flex; align-items: center; gap: .5rem; margin-left: .5rem; }
    .err { color: #b91c1c; }
    .assign-field { width: 240px; margin-right: .5rem; }
    .chips { display: flex; flex-wrap: wrap; gap: .25rem; }
    .chip { display: inline-flex; align-items: center; gap: .25rem; padding: .25rem .5rem; border-radius: 9999px; background: rgba(0,0,0,0.06); }
    .skeleton-table { padding: .5rem 0; }
    .skeleton-table .row { display: grid; grid-template-columns: 120px 1fr 160px 160px; gap: 12px; padding: 10px 0; }
    .skeleton-table .cell { height: 16px; border-radius: 8px; background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.10) 37%, rgba(0,0,0,.06) 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; display: inline-block; }
    .skeleton-table .w-24 { width: 96px; }
    .skeleton-table .w-28 { width: 112px; }
    .skeleton-table .w-32 { width: 128px; }
    .skeleton-table .w-40 { width: 160px; }
    @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
    .empty { text-align: center; padding: 24px 8px; color: #334155; }
  `]
})
export class EmployeesComponent {
  displayedColumns = ['name', 'email', 'department', 'assign', 'assigned', 'actions'];
  dataSource = new MatTableDataSource<Employee>([]);
  projects: Project[] = [];
  selection: Record<number, number | undefined> = {};
  csvPreview: { name: string; email: string; department: string }[] = [];
  csvError = '';

  loading = true;

  constructor(private readonly employees: EmployeesService, private readonly projectsSvc: ProjectsService, private readonly snack: MatSnackBar, private readonly notifications: NotificationService, private readonly dialog: MatDialog) {
    this.dataSource.data = this.employees.list();
    this.projects = this.projectsSvc.list();
    // UI-only: minimal delay to show skeletons on initial load
    setTimeout(() => { this.loading = false; }, 350);
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value?.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  assigned(e: Employee): Project[] {
    return this.employees.projectsFor(e);
  }

  assign(e: Employee) {
    const pid = this.selection[e.id];
    if (!pid) return;
    this.employees.assign(e.id, pid);
    this.snack.open('Assigned to project', 'OK', { duration: 2000 });
    const p = this.projects.find(x => x.id === pid);
    if (p) this.notifications.push(`Assigned ${e.name} to ${p.projectName}`);
  }

  unassign(e: Employee, p: Project) {
    this.employees.unassign(e.id, p.id);
    this.snack.open('Unassigned from project', 'OK', { duration: 2000 });
    this.notifications.push(`Unassigned ${e.name} from ${p.projectName}`);
  }

  remove(e: Employee) {
    if (!confirm(`Delete ${e.name}? This cannot be undone.`)) return;
    this.employees.remove(e.id);
    this.dataSource.data = this.employees.list();
    this.snack.open('Employee removed', 'OK', { duration: 2000 });
    // Best-effort: remove from backend DB as well
    if (e.email) {
      fetch(`http://localhost:8080/api/users/by-email?email=${encodeURIComponent(e.email)}`, { method: 'DELETE' }).catch(() => {});
    }
  }

  onFileSelected(e: Event) {
    this.csvError = '';
    this.csvPreview = [];
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        this.csvPreview = this.parseCsv(text);
        if (!this.csvPreview.length) this.csvError = 'No valid rows found.';
      } catch (err) {
        this.csvError = 'Failed to parse CSV.';
      }
    };
    reader.readAsText(file);
  }

  importCsv() {
    if (!this.csvPreview.length) return;
    const added = this.employees.addMany(this.csvPreview);
    this.dataSource.data = this.employees.list();
    this.snack.open(`Imported ${added} employees`, 'OK', { duration: 2000 });
    this.csvPreview = [];
  }

  addEmployee() {
    const ref = this.dialog.open(VolunteerDialogComponent, { width: '520px', data: { mode: 'add' } });
    ref.afterClosed().subscribe((val: { name: string; email: string; department: string } | undefined) => {
      if (!val) return;
      const added = this.employees.addMany([{ name: val.name, email: val.email, department: val.department }]);
      this.dataSource.data = this.employees.list();
      if (added) this.snack.open('Employee added', 'OK', { duration: 1500 });
      // Fire welcome email (best-effort)
      if (val.email) {
        fetch('http://localhost:8080/api/notify/employee-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: val.name, email: val.email })
        }).then(async (r) => {
          if (r.ok) {
            this.snack.open('Welcome email sent', 'OK', { duration: 2000 });
          } else {
            const t = await r.text();
            this.snack.open('Email failed: ' + (t || r.status), 'OK', { duration: 2500 });
          }
        }).catch(() => this.snack.open('Email service not reachable', 'OK', { duration: 2000 }));
      }
    });
  }

  private parseCsv(text: string): { name: string; email: string; department: string }[] {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    // detect header
    const first = lines[0].toLowerCase();
    let startIdx = 0;
    let nameIdx = 0, emailIdx = 1, deptIdx = 2;
    if (first.includes('name') || first.includes('email')) {
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      nameIdx = headers.findIndex(h => h.includes('name'));
      emailIdx = headers.findIndex(h => h.includes('email'));
      deptIdx = headers.findIndex(h => h.includes('dept') || h.includes('department'));
      if (emailIdx < 0) emailIdx = 1; if (nameIdx < 0) nameIdx = 0; if (deptIdx < 0) deptIdx = 2;
      startIdx = 1;
    }
    const out: { name: string; email: string; department: string }[] = [];
    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length < 2) continue;
      const name = (cols[nameIdx] || '').trim();
      const email = (cols[emailIdx] || '').trim();
      const department = (cols[deptIdx] || 'General').trim();
      if (!name || !email) continue;
      out.push({ name, email, department });
    }
    return out;
  }
}
