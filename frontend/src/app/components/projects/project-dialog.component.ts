import { Component, Inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Project, ProjectStatus } from '../../projects.service';
import { ProjectsService } from '../../projects.service';

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatAutocompleteModule],
  template: `
    <h2 mat-dialog-title>{{ data.id ? 'Edit' : 'Add' }} Project</h2>
    <form [formGroup]="form" (ngSubmit)="save()" class="form">
      <div class="grid">
        <mat-form-field appearance="outline" class="field">
          <mat-label>Project Name</mat-label>
          <input matInput formControlName="projectName" required cdkFocusInitial>
          <mat-error *ngIf="form.get('projectName')?.hasError('required')">Required</mat-error>
          <mat-error *ngIf="form.get('projectName')?.hasError('exists')">Name already exists</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Department</mat-label>
          <input matInput formControlName="department" [matAutocomplete]="deptAuto" required>
          <mat-autocomplete #deptAuto="matAutocomplete">
            <mat-option *ngFor="let d of departments" [value]="d">{{ d }}</mat-option>
          </mat-autocomplete>
          <mat-error *ngIf="form.get('department')?.hasError('required')">Required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Budget</mat-label>
          <input matInput type="number" formControlName="budget" required>
          <mat-error *ngIf="form.get('budget')?.hasError('required')">Required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Used Budget</mat-label>
          <input matInput type="number" formControlName="usedBudget">
          <mat-hint>Remaining: {{ remainingBudget() | number }}</mat-hint>
          <mat-error *ngIf="form.get('usedBudget')?.hasError('lteBudget')">Used must be ≤ Budget</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Seats available</mat-label>
          <input matInput type="number" min="0" formControlName="seats" placeholder="e.g. 25">
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="startDate" required>
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
          <mat-error *ngIf="form.get('startDate')?.hasError('required')">Required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>End Date</mat-label>
          <input matInput [matDatepicker]="endPicker" formControlName="endDate" required>
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
          <mat-error *ngIf="form.get('endDate')?.hasError('required')">Required</mat-error>
          <mat-error *ngIf="form.get('endDate')?.hasError('gteStart')">End date must be ≥ Start date</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" required>
            <mat-option *ngFor="let s of statuses" [value]="s">{{ s }}</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('status')?.hasError('required')">Required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="desc">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </div>

      <div class="tools">
        <div class="group">
          <span class="label">Quick Budget</span>
          <button mat-stroked-button type="button" (click)="setBudget(50000)">50k</button>
          <button mat-stroked-button type="button" (click)="setBudget(100000)">1L</button>
          <button mat-stroked-button type="button" (click)="setBudget(500000)">5L</button>
        </div>
        <div class="group">
          <span class="label">Dates</span>
          <button mat-stroked-button type="button" (click)="setDates(0,7)">This week</button>
          <button mat-stroked-button type="button" (click)="setDates(0,30)">+30 days</button>
          <button mat-stroked-button type="button" (click)="setDates(1,90)">Next quarter</button>
        </div>
        <div class="group">
          <span class="label">Template</span>
          <button mat-stroked-button type="button" (click)="applyTemplate()">Apply last</button>
          <button mat-stroked-button type="button" (click)="saveTemplate()">Save template</button>
        </div>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
      </div>
    </form>
  `,
  styles: [`
    .form { display: grid; gap: 1rem; }
    .grid { display: grid; gap: .75rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .field { width: 100%; }
    .desc { grid-column: span 2 / span 2; }
    .tools { display: flex; gap: .75rem; flex-wrap: wrap; align-items: center; margin-top: .25rem; }
    .tools .group { display: flex; gap: .5rem; align-items: center; }
    .tools .label { font-size: .85rem; opacity: .8; margin-right: .25rem; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } .desc { grid-column: auto; } }
  `]
})
export class ProjectDialogComponent {
  form: FormGroup;
  statuses: ProjectStatus[] = ['Planned', 'Ongoing', 'Completed'];
  departments: string[] = [];

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<ProjectDialogComponent, Project>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Project>,
    private readonly svc: ProjectsService
  ) {
    this.form = this.fb.group({
      projectName: [data?.projectName ?? '', [Validators.required, this.uniqueNameValidator()]],
      department: [data?.department ?? '', Validators.required],
      budget: [data?.budget ?? 0, [Validators.required, Validators.min(0)]],
      usedBudget: [data?.usedBudget ?? 0, [this.usedLteBudgetValidator()]],
      seats: [data?.seats ?? 0, [Validators.min(0)]],
      startDate: [data?.startDate ? new Date(data.startDate as any) : null, Validators.required],
      endDate: [data?.endDate ? new Date(data.endDate as any) : null, [Validators.required, this.endGteStartValidator()]],
      status: [data?.status ?? 'Planned', Validators.required],
      description: [data?.description ?? '']
    });

    // preload departments suggestions
    const list = this.svc.list();
    this.departments = Array.from(new Set(list.map(p => p.department).filter(Boolean))).sort();

    // restore draft
    const draftRaw = localStorage.getItem('project.dialog.draft');
    if (!data?.id && draftRaw) {
      try { this.form.patchValue(this.inflateDraft(JSON.parse(draftRaw))); } catch {}
    }

    // auto status + draft save
    this.form.valueChanges.subscribe(() => {
      this.autoStatus();
      localStorage.setItem('project.dialog.draft', JSON.stringify(this.deflateDraft()));
    });
  }

  save() {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const toIso = (d: any) => d instanceof Date ? d.toISOString().slice(0,10) : (typeof d === 'string' ? d : '');
    const payload: Project = {
      ...(this.data as any),
      projectName: value.projectName!,
      department: value.department!,
      budget: value.budget!,
      usedBudget: value.usedBudget ?? 0,
      seats: value.seats ?? 0,
      startDate: toIso(value.startDate),
      endDate: toIso(value.endDate),
      status: value.status!,
      description: value.description ?? ''
    } as Project;
    // clear draft after successful save
    localStorage.removeItem('project.dialog.draft');
    this.dialogRef.close(payload);
  }

  // Keyboard quick actions
  @HostListener('document:keydown.escape') onEsc() { this.dialogRef.close(); }

  // Helpers
  remainingBudget() {
    const b = Number(this.form.get('budget')?.value || 0);
    const u = Number(this.form.get('usedBudget')?.value || 0);
    return Math.max(0, b - u);
  }

  setBudget(val: number) {
    this.form.get('budget')?.setValue(val);
    if (Number(this.form.get('usedBudget')?.value || 0) > val) this.form.get('usedBudget')?.setValue(val);
  }

  setDates(offsetStartDays: number, durationDays: number) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() + offsetStartDays);
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);
    this.form.get('startDate')?.setValue(start);
    this.form.get('endDate')?.setValue(end);
    this.autoStatus();
  }

  autoStatus() {
    const s = this.form.get('startDate')?.value as Date | null;
    const e = this.form.get('endDate')?.value as Date | null;
    if (!s || !e) return;
    const today = new Date();
    const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const sd = day(s), ed = day(e), td = day(today);
    let next: ProjectStatus = 'Planned';
    if (ed < td) next = 'Completed';
    else if (sd <= td && td <= ed) next = 'Ongoing';
    else next = 'Planned';
    if (this.form.get('status')?.value !== next) this.form.get('status')?.setValue(next);
  }

  // Templates
  saveTemplate() { localStorage.setItem('project.dialog.template', JSON.stringify(this.deflateDraft())); }
  applyTemplate() {
    const raw = localStorage.getItem('project.dialog.template');
    if (!raw) return;
    try { this.form.patchValue(this.inflateDraft(JSON.parse(raw))); this.autoStatus(); } catch {}
  }

  deflateDraft() {
    const v = this.form.getRawValue();
    const sd = v.startDate instanceof Date ? v.startDate.toISOString() : v.startDate;
    const ed = v.endDate instanceof Date ? v.endDate.toISOString() : v.endDate;
    return { ...v, startDate: sd, endDate: ed };
  }
  inflateDraft(obj: any) {
    const toDate = (x: any) => (x ? new Date(x) : null);
    return { ...obj, startDate: toDate(obj?.startDate), endDate: toDate(obj?.endDate) };
  }

  // Validators
  uniqueNameValidator() {
    const existing = new Set(this.svc.list().map(p => (p.projectName || '').toLowerCase()));
    const currentId = (this.data as any)?.id;
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const name = String(ctrl.value || '').toLowerCase().trim();
      if (!name) return null;
      // allow same name if editing same project id
      if (currentId) return null;
      return existing.has(name) ? { exists: true } : null;
    };
  }

  usedLteBudgetValidator() {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const used = Number(ctrl.value || 0);
      const b = Number(this.form?.get('budget')?.value || 0);
      return used > b ? { lteBudget: true } : null;
    };
  }

  endGteStartValidator() {
    return (_: AbstractControl): ValidationErrors | null => {
      const s = this.form?.get('startDate')?.value as Date | null;
      const e = this.form?.get('endDate')?.value as Date | null;
      if (!s || !e) return null;
      const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return day(e) < day(s) ? { gteStart: true } : null;
    };
  }
}
