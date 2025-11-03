import { Injectable, signal } from '@angular/core';

export type ProjectStatus = 'Planned' | 'Ongoing' | 'Completed';
export interface Project {
  id: number;
  projectName: string;
  department: string;
  budget: number;
  usedBudget?: number;
  startDate: string; // ISO yyyy-MM-dd
  endDate: string;   // ISO yyyy-MM-dd
  status: ProjectStatus;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  seats?: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly KEY = 'projects.data';
  private seq = 3;
  readonly projects = signal<Project[]>([]);

  constructor() {
    const saved = localStorage.getItem(this.KEY);
    if (saved) {
      const list = JSON.parse(saved) as Project[];
      this.projects.set(list);
      this.seq = list.reduce((m, p) => Math.max(m, p.id), 0);
    } else {
      const seed: Project[] = [
        { id: 1, projectName: 'Tree Plantation Drive', department: 'Environment', budget: 500000, usedBudget: 120000, startDate: '2025-01-10', endDate: '2025-12-20', status: 'Ongoing', description: 'City-wide plantation of saplings.', location: 'City Park', latitude: 19.0760, longitude: 72.8777, seats: 25 },
        { id: 2, projectName: 'School Education Program', department: 'Education', budget: 800000, usedBudget: 300000, startDate: '2025-02-01', endDate: '2025-10-30', status: 'Planned', description: 'After-school coaching for underserved communities.', location: 'Community School', latitude: 28.6139, longitude: 77.2090, seats: 10 },
        { id: 3, projectName: 'Health Camp', department: 'Healthcare', budget: 300000, usedBudget: 50000, startDate: '2025-03-15', endDate: '2025-07-15', status: 'Completed', description: 'Free medical checkups and medicines.', location: 'Town Hall', latitude: 13.0827, longitude: 80.2707, seats: 0 }
      ];
      this.projects.set(seed);
      localStorage.setItem(this.KEY, JSON.stringify(seed));
    }
  }

  list(): Project[] { return this.projects(); }

  add(p: Omit<Project, 'id'>): Project {
    const item: Project = { id: ++this.seq, ...p };
    const next = [...this.projects(), item];
    this.projects.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    return item;
  }

  update(id: number, patch: Partial<Project>): Project | undefined {
    const list = this.projects();
    const idx = list.findIndex(x => x.id === id);
    if (idx < 0) return undefined;
    const updated = { ...list[idx], ...patch } as Project;
    const next = [...list];
    next[idx] = updated;
    this.projects.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    return updated;
  }

  remove(id: number) {
    const next = this.projects().filter(x => x.id !== id);
    this.projects.set(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
  }
}
