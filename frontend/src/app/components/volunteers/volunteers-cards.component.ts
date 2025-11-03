import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeesService, Employee } from '../../employees.service';

@Component({
  selector: 'app-volunteers-cards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="section">
      <div class="header">
        <h2>Volunteers</h2>
        <button mat-raised-button color="primary" (click)="add()">
          <mat-icon>person_add</mat-icon>
          Add Volunteer
        </button>
      </div>

      <div class="tools">
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="q" (ngModelChange)="apply()" placeholder="name or email" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Sort</mat-label>
          <mat-select [(ngModel)]="sort" (selectionChange)="apply()">
            <mat-option value="name">A–Z</mat-option>
            <mat-option value="hours">Hours</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="grid">
        <mat-card class="v-card glass hover-pop" *ngFor="let v of shown" (click)="edit(v)">
          <div class="avatar">{{ initials(v.name) }}</div>
          <mat-card-content>
            <div class="name">{{ v.name }}</div>
            <div class="email">{{ v.email }}</div>
            <div class="meta">Department: {{ v.department }}</div>
            <div class="hours">Total Hours: {{ hours(v) }}</div>
          </mat-card-content>
          <div class="actions">
            <button mat-icon-button color="primary" (click)="edit(v); $event.stopPropagation()"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="remove(v); $event.stopPropagation()"><mat-icon>delete</mat-icon></button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: `
    .section { padding: 1rem; display: grid; gap: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .tools { display: flex; gap: .5rem; flex-wrap: wrap; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: .75rem; }
    @media (max-width: 1200px) { .grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
    @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
    .v-card { position: relative; overflow: hidden; }
    .avatar { width: 64px; height: 64px; border-radius: 9999px; background: linear-gradient(135deg, #0ea5e9, #10b981); color: white; display: grid; place-items: center; font-weight: 700; font-size: 1.1rem; margin: .75rem; }
    .name { font-weight: 600; }
    .email { opacity: .8; font-size: .9rem; }
    .meta, .hours { font-size: .85rem; opacity: .85; }
    .actions { position: absolute; right: .25rem; top: .25rem; display: flex; gap: .25rem; }
  `
})
export class VolunteersCardsComponent {
  q = '';
  sort: 'name' | 'hours' = 'name';
  shown: Employee[] = [];

  constructor(private readonly svc: EmployeesService, private readonly dlg: MatDialog, private readonly snack: MatSnackBar) {
    this.apply();
  }

  private all(): Employee[] { return this.svc.list(); }

  apply() {
    const q = this.q.trim().toLowerCase();
    const filtered = this.all().filter(v => !q || v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q));
    const sorted = [...filtered].sort((a, b) => this.sort === 'name' ? a.name.localeCompare(b.name) : this.hours(b) - this.hours(a));
    this.shown = sorted;
  }

  initials(name: string) { return (name || '?').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase(); }
  hours(_v: Employee) { return Math.floor(Math.random() * 120); } // mock hours

  add() {
    const ref = this.dlg.open(VolunteerDialogComponent, { width: '520px', data: { mode: 'add' } });
    ref.afterClosed().subscribe((val: { name: string; email: string; department: string } | undefined) => {
      if (!val) return;
      // reuse EmployeesService.addMany
      const added = this.svc.addMany([{ name: val.name, email: val.email, department: val.department }]);
      if (added) this.snack.open('Volunteer added', 'OK', { duration: 1500 });
      this.apply();
    });
  }

  edit(v: Employee) {
    const ref = this.dlg.open(VolunteerDialogComponent, { width: '520px', data: { mode: 'edit', value: { name: v.name, email: v.email, department: v.department } } });
    ref.afterClosed().subscribe((val: { name: string; email: string; department: string } | undefined) => {
      if (!val) return;
      // persist update via service to ensure localStorage is updated
      this.svc.update(v.id, val);
      this.snack.open('Volunteer updated', 'OK', { duration: 1500 });
      this.apply();
    });
  }

  remove(v: Employee) {
    if (!confirm('Delete this volunteer?')) return;
    // persist delete via service so localStorage is updated
    this.svc.remove(v.id);
    this.snack.open('Volunteer removed', 'OK', { duration: 1500 });
    this.apply();
  }
}

@Component({
  selector: 'app-volunteer-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ data?.mode === 'edit' ? 'Edit' : 'Add' }} Volunteer</h2>
    <form [formGroup]="form" (ngSubmit)="save()" class="form">
      <mat-form-field appearance="outline" class="field">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="field">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="field">
        <mat-label>Department</mat-label>
        <mat-select formControlName="department">
          <mat-option value="Education">Education</mat-option>
          <mat-option value="Environment">Environment</mat-option>
          <mat-option value="Healthcare">Health</mat-option>
        </mat-select>
      </mat-form-field>
      <div class="actions">
        <button mat-stroked-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
      </div>
    </form>
  `,
  styles: `
    .form { display: grid; gap: .5rem; padding: .5rem; }
    .field { width: 100%; }
    .actions { display: flex; gap: .5rem; justify-content: flex-end; }
  `
})
export class VolunteerDialogComponent {
  form!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private ref: MatDialogRef<VolunteerDialogComponent>) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['Education', Validators.required]
    });
    if (data?.value) this.form.patchValue(data.value);
  }

  save() {
    if (this.form.invalid) return;
    this.ref.close(this.form.value);
  }
}
