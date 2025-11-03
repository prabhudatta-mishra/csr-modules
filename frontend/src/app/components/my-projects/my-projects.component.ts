import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';
import { EmployeesService } from '../../employees.service';
import { ProjectsService, Project } from '../../projects.service';
import { ProgressService, ProgressUpdate } from '../../progress.service';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="section">
      <h2>My Projects</h2>

      <ng-container *ngIf="projects.length; else noAssign">
        <div class="grid">
          <mat-card appearance="outlined" *ngFor="let p of projects">
            <mat-card-header>
              <mat-card-title>{{ p.projectName }}</mat-card-title>
              <mat-card-subtitle>{{ p.department }} • {{ p.status }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Budget:</strong> {{ p.budget | number }} (Used {{ p.usedBudget || 0 | number }})</p>
              <p><strong>Dates:</strong> {{ p.startDate }} → {{ p.endDate }}</p>

              <form [formGroup]="forms[p.id]" (ngSubmit)="submit(p)" class="form">
                <mat-form-field appearance="outline" class="field">
                  <mat-label>Progress note</mat-label>
                  <textarea matInput rows="2" formControlName="note" required></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="field small">
                  <mat-label>Hours</mat-label>
                  <input matInput type="number" min="0" formControlName="hours">
                </mat-form-field>
                <div class="actions">
                  <button mat-raised-button color="primary" type="submit" [disabled]="forms[p.id].invalid">Submit</button>
                </div>
              </form>

              <div class="updates" *ngIf="updatesByProject[p.id]?.length">
                <h4>Recent updates</h4>
                <ul>
                  <li *ngFor="let u of updatesByProject[p.id]">
                    <span>{{ u.date | date:'short' }} • {{ u.note }} <ng-container *ngIf="u.hours">({{ u.hours }}h)</ng-container></span>
                  </li>
                </ul>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>

      <ng-template #noAssign>
        <mat-card appearance="outlined"><mat-card-content>No assigned projects.</mat-card-content></mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .section { padding: 1rem; display: grid; gap: 1rem; }
    .grid { display: grid; gap: 1rem; grid-template-columns: repeat(2, minmax(0,1fr)); }
    @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
    .form { display: grid; gap: .5rem; grid-template-columns: 1fr 180px auto; align-items: end; margin-top: .5rem; }
    .field { width: 100%; }
    .field.small { width: 180px; }
    .actions { display: flex; justify-content: flex-end; }
    .updates { margin-top: .75rem; }
    .updates ul { margin: 0; padding-left: 1rem; }
  `]
})
export class MyProjectsComponent {
  projects: Project[] = [];
  forms: Record<number, FormGroup> = {};
  updatesByProject: Record<number, ProgressUpdate[]> = {};

  constructor(
    private readonly auth: AuthService,
    private readonly employees: EmployeesService,
    private readonly projectsSvc: ProjectsService,
    private readonly progress: ProgressService,
    private readonly fb: FormBuilder,
    private readonly snack: MatSnackBar
  ) {
    const uid = this.auth.userId();
    if (uid == null) return;
    // In mock: user id 1 corresponds to employee id 1
    const emp = this.employees.list().find((e: any) => e.id === uid);
    const all = this.projectsSvc.list();
    this.projects = emp ? all.filter((p: any) => emp.assignedProjectIds.includes(p.id)) : [];
    // init forms and updates
    for (const p of this.projects) {
      this.forms[p.id] = this.fb.group({ note: ['', Validators.required], hours: [null] });
      this.updatesByProject[p.id] = this.progress.listFor(p.id, uid);
    }
  }

  submit(p: Project) {
    const uid = this.auth.userId();
    if (uid == null) return;
    const f = this.forms[p.id];
    if (f.invalid) return;
    const { note, hours } = f.getRawValue();
    const u = this.progress.add({ projectId: p.id, employeeId: uid, note: note!, hours: hours ?? undefined });
    this.updatesByProject[p.id] = [u, ...(this.updatesByProject[p.id] || [])];
    f.reset();
    this.snack.open('Progress submitted', 'OK', { duration: 2000 });
  }
}
