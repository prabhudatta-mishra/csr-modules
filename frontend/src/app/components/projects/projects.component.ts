import { Component, ViewChild, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Project, ProjectsService } from '../../projects.service';
import { ProjectDialogComponent } from './project-dialog.component';
import { ConfirmDialogComponent, ConfirmData } from './confirm-dialog.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="section">
      <div class="header">
        <h2>Projects</h2>
        <button mat-raised-button color="primary" (click)="add()">
          <mat-icon fontSet="material-icons" fontIcon="add"></mat-icon>
          Add Project
        </button>
      </div>

      <mat-card appearance="outlined">
        <mat-card-content>
          <ng-container *ngIf="loading; else tableBlock">
            <div class="skeleton-table">
              <div class="row" *ngFor="let i of [1,2,3,4,5,6]">
                <span class="cell w-16"></span>
                <span class="cell w-40"></span>
                <span class="cell w-28"></span>
                <span class="cell w-24"></span>
                <span class="cell w-20"></span>
                <span class="cell w-24"></span>
              </div>
            </div>
          </ng-container>
          <ng-template #tableBlock>
            <ng-container *ngIf="dataSource.data.length; else emptyState">
          <div class="table-tools">
            <mat-form-field appearance="outline">
              <mat-label>Filter</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Search projects">
            </mat-form-field>
            <button mat-stroked-button color="primary" (click)="saveCurrentView()">
              <mat-icon fontSet="material-icons" fontIcon="bookmark_add"></mat-icon>
              Save View
            </button>
          </div>
          <div class="views" *ngIf="views().length">
            <span>Saved views:</span>
            <span class="chip" *ngFor="let v of views()" (click)="applyView(v.name)">
              <mat-icon fontSet="material-icons" fontIcon="bookmark"></mat-icon>
              {{ v.name }}
              <button mat-icon-button (click)="removeView(v.name); $event.stopPropagation()" aria-label="Delete view"><mat-icon fontSet="material-icons" fontIcon="close"></mat-icon></button>
            </span>
          </div>

          <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z1">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let p">{{ p.id }}</td>
            </ng-container>

            <ng-container matColumnDef="projectName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let p">{{ p.projectName }}</td>
            </ng-container>

            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
              <td mat-cell *matCellDef="let p">{{ p.department }}</td>
            </ng-container>

            <ng-container matColumnDef="budget">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Budget</th>
              <td mat-cell *matCellDef="let p">{{ p.budget | number }}</td>
            </ng-container>

            <ng-container matColumnDef="usedBudget">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Used</th>
              <td mat-cell *matCellDef="let p">{{ p.usedBudget || 0 | number }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let p">{{ p.status }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button color="primary" (click)="edit(p)" aria-label="Edit">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
                  </svg>
                </button>
                <button mat-icon-button color="warn" (click)="remove(p)" aria-label="Delete">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1z"/>
                  </svg>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <mat-paginator [pageSize]="5" [pageSizeOptions]="[5,10,20]"></mat-paginator>
            </ng-container>
            <ng-template #emptyState>
              <div class="empty">
                <h3>No projects yet</h3>
                <p>Create your first project to get started.</p>
                <button mat-raised-button color="primary" (click)="add()">Add Project</button>
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
    .views { display: flex; align-items: center; gap: .25rem; flex-wrap: wrap; margin-bottom: .5rem; }
    .views .chip { display: inline-flex; align-items: center; gap: .25rem; padding: .25rem .5rem; border-radius: 9999px; background: rgba(0,0,0,0.06); cursor: pointer; }
    table { width: 100%; }
    .skeleton-table { padding: .5rem 0; }
    .skeleton-table .row { display: grid; grid-template-columns: 64px 1fr 180px 140px 120px 120px; gap: 12px; padding: 10px 0; }
    .skeleton-table .cell { height: 16px; border-radius: 8px; background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.10) 37%, rgba(0,0,0,.06) 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; display: inline-block; }
    .skeleton-table .w-16 { width: 64px; }
    .skeleton-table .w-20 { width: 80px; }
    .skeleton-table .w-24 { width: 96px; }
    .skeleton-table .w-28 { width: 112px; }
    .skeleton-table .w-40 { width: 160px; }
    @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
    .empty { text-align: center; padding: 24px 8px; color: #334155; }
  `]
})
export class ProjectsComponent {
  protected displayedColumns = ['id', 'projectName', 'department', 'budget', 'usedBudget', 'status', 'actions'];
  protected dataSource = new MatTableDataSource<Project>([]);
  protected views = signal<{ name: string; filter: string }[]>(this.loadViews());

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = true;

  constructor(private readonly svc: ProjectsService, private readonly dialog: MatDialog, private readonly snack: MatSnackBar, private readonly route: ActivatedRoute, private readonly router: Router) {
    effect(() => {
      this.dataSource.data = this.svc.projects();
    });
    // If navigated with ?add=1 (from command palette), open the add dialog automatically
    const add = this.route.snapshot.queryParamMap.get('add');
    if (add) {
      setTimeout(() => this.add());
      // Clean the query param from URL
      this.router.navigate([], { queryParams: { add: null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) {
      // preset table filter from query
      this.dataSource.filter = q.trim().toLowerCase();
      // Clean the query param from URL
      this.router.navigate([], { queryParams: { q: null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
    // UI-only: small delay to show skeletons
    setTimeout(() => { this.loading = false; }, 350);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value?.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  saveCurrentView() {
    const name = prompt('Save current filter as view name:');
    if (!name) return;
    const filter = this.dataSource.filter || '';
    const existing = this.views().filter(v => v.name !== name);
    const next = [...existing, { name, filter }];
    this.views.set(next);
    this.saveViews(next);
    this.snack.open('View saved', 'OK', { duration: 2000 });
  }

  applyView(name: string) {
    const v = this.views().find(x => x.name === name);
    if (!v) return;
    this.dataSource.filter = (v.filter || '').trim().toLowerCase();
    this.snack.open(`Applied view: ${name}`, 'OK', { duration: 1500 });
  }

  removeView(name: string) {
    const next = this.views().filter(v => v.name !== name);
    this.views.set(next);
    this.saveViews(next);
    this.snack.open('View removed', 'OK', { duration: 1500 });
  }

  private loadViews(): { name: string; filter: string }[] {
    try { return JSON.parse(localStorage.getItem('projects.views') || '[]'); } catch { return []; }
  }

  private saveViews(list: { name: string; filter: string }[]) {
    localStorage.setItem('projects.views', JSON.stringify(list));
  }

  add() {
    const ref = this.dialog.open(ProjectDialogComponent, { width: '640px', data: {} });
    ref.afterClosed().subscribe((result: Project | undefined) => {
      if (!result) return;
      this.svc.add({
        projectName: result.projectName,
        department: result.department,
        budget: result.budget,
        usedBudget: result.usedBudget ?? 0,
        seats: result.seats ?? 0,
        startDate: result.startDate,
        endDate: result.endDate,
        status: result.status,
        description: result.description
      });
      this.snack.open('Project created', 'OK', { duration: 2000 });
    });
  }

  edit(p: Project) {
    const ref = this.dialog.open(ProjectDialogComponent, { width: '640px', data: { ...p } });
    ref.afterClosed().subscribe((result: Project | undefined) => {
      if (!result) return;
      this.svc.update(p.id, result);
      this.snack.open('Project updated', 'OK', { duration: 2000 });
    });
  }

  remove(p: Project) {
    const ref = this.dialog.open(ConfirmDialogComponent, { width: '360px', data: { title: 'Delete project', message: `Delete ${p.projectName}?`, confirmText: 'Delete' } as ConfirmData });
    ref.afterClosed().subscribe(yes => {
      if (!yes) return;
      this.svc.remove(p.id);
      this.snack.open('Project deleted', 'OK', { duration: 2000 });
    });
  }
}
