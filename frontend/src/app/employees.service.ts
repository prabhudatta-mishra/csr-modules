import { Injectable, signal } from '@angular/core';
import { Project, ProjectsService } from './projects.service';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  assignedProjectIds: number[];
}

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly KEY = 'employees.data';
  private seq = 5;
  readonly employees = signal<Employee[]>([]);

  constructor(private readonly projects: ProjectsService) {
    const saved = localStorage.getItem(this.KEY);
    if (saved) {
      const list = JSON.parse(saved) as Employee[];
      this.employees.set(list);
      this.seq = list.reduce((m, e) => Math.max(m, e.id), 0);
    } else {
      const seed: Employee[] = [
        { id: 1, name: 'Alice Johnson', email: 'alice@corp.com', department: 'Environment', assignedProjectIds: [1] },
        { id: 2, name: 'Bob Singh', email: 'bob@corp.com', department: 'Education', assignedProjectIds: [2] },
        { id: 3, name: 'Chitra Rao', email: 'chitra@corp.com', department: 'Healthcare', assignedProjectIds: [3] },
        { id: 4, name: 'Daniel Kim', email: 'daniel@corp.com', department: 'Environment', assignedProjectIds: [] },
        { id: 5, name: 'Eva Lopez', email: 'eva@corp.com', department: 'Education', assignedProjectIds: [] }
      ];
      this.employees.set(seed);
      localStorage.setItem(this.KEY, JSON.stringify(seed));
    }
  }

  list(): Employee[] { return this.employees(); }

  addMany(newOnes: Omit<Employee, 'id' | 'assignedProjectIds'>[]) {
    const current = this.employees();
    const emails = new Set(current.map(e => e.email.toLowerCase()));
    const toAdd: Employee[] = [];
    for (const n of newOnes) {
      if (!n.email || emails.has(n.email.toLowerCase())) continue;
      const item: Employee = { id: ++this.seq, name: n.name, email: n.email, department: n.department || 'General', assignedProjectIds: [] };
      emails.add(item.email.toLowerCase());
      toAdd.push(item);
    }
    if (toAdd.length) {
      const next = [...current, ...toAdd];
      this.employees.set(next);
      localStorage.setItem(this.KEY, JSON.stringify(next));
    }
    return toAdd.length;
  }

  addOrGet(profile: { name: string; email: string; profession?: string; department?: string }): Employee {
    const list = this.employees();
    const found = list.find(e => e.email.toLowerCase() === (profile.email || '').toLowerCase());
    if (found) {
      // Optionally update name/department
      const updated: Employee = { ...found, name: profile.name || found.name, department: (profile.department || profile.profession || found.department || 'General') };
      if (updated !== found) {
        const next = list.map(e => e.id === updated.id ? updated : e);
        this.employees.set(next);
        localStorage.setItem(this.KEY, JSON.stringify(next));
      }
      return updated;
    }
    const item: Employee = { id: ++this.seq, name: profile.name || 'User', email: profile.email || `user${this.seq}@local`, department: profile.department || profile.profession || 'General', assignedProjectIds: [] };
    const next = [...list, item];
    this.employees.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    return item;
  }

  assign(employeeId: number, projectId: number) {
    const list = this.employees();
    const idx = list.findIndex(e => e.id === employeeId);
    if (idx < 0) return;
    const e = { ...list[idx] } as Employee;
    if (!e.assignedProjectIds.includes(projectId)) e.assignedProjectIds = [...e.assignedProjectIds, projectId];
    const next = [...list];
    next[idx] = e;
    this.employees.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
  }

  unassign(employeeId: number, projectId: number) {
    const list = this.employees();
    const idx = list.findIndex(e => e.id === employeeId);
    if (idx < 0) return;
    const e = { ...list[idx] } as Employee;
    e.assignedProjectIds = e.assignedProjectIds.filter(id => id !== projectId);
    const next = [...list];
    next[idx] = e;
    this.employees.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
  }

  projectsFor(e: Employee): Project[] {
    const all = this.projects.list();
    return all.filter(p => e.assignedProjectIds.includes(p.id));
  }

  update(id: number, patch: Partial<Employee>) {
    const list = this.employees();
    const idx = list.findIndex(e => e.id === id);
    if (idx < 0) return;
    const updated = { ...list[idx], ...patch } as Employee;
    const next = [...list];
    next[idx] = updated;
    this.employees.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
  }

  remove(employeeId: number) {
    const list = this.employees();
    const next = list.filter(e => e.id !== employeeId);
    if (next.length === list.length) return;
    this.employees.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
  }
}
