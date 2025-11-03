import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProjectsService, Project } from '../../projects.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects-board',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, DragDropModule, RouterLink],
  template: `
    <div class="section">
      <div class="header">
        <h2>Projects Board</h2>
        <a mat-stroked-button color="primary" routerLink="/projects">Back to Table</a>
      </div>

      <div class="board">
        <div class="lane">
          <h3>Planned</h3>
          <div cdkDropList [cdkDropListData]="planned" class="list glass" (cdkDropListDropped)="drop($event, 'Planned')">
            <div class="card hover-pop" cdkDrag *ngFor="let p of planned">
              <div class="title">{{ p.projectName }}</div>
              <div class="meta">{{ p.department }} • {{ p.budget | number }}</div>
              <div class="chips">
                <span class="chip status planned">Planned</span>
                <span class="chip budget" *ngIf="p.usedBudget != null">{{ (p.usedBudget || 0) | number }}/{{ p.budget | number }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lane">
          <h3>Ongoing</h3>
          <div cdkDropList [cdkDropListData]="ongoing" class="list glass" (cdkDropListDropped)="drop($event, 'Ongoing')">
            <div class="card hover-pop" cdkDrag *ngFor="let p of ongoing">
              <div class="title">{{ p.projectName }}</div>
              <div class="meta">{{ p.department }} • {{ p.budget | number }}</div>
              <div class="chips">
                <span class="chip status ongoing">Ongoing</span>
                <span class="chip budget" *ngIf="p.usedBudget != null">{{ (p.usedBudget || 0) | number }}/{{ p.budget | number }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lane">
          <h3>Completed</h3>
          <div cdkDropList [cdkDropListData]="completed" class="list glass" (cdkDropListDropped)="drop($event, 'Completed')">
            <div class="card hover-pop" cdkDrag *ngFor="let p of completed">
              <div class="title">{{ p.projectName }}</div>
              <div class="meta">{{ p.department }} • {{ p.budget | number }}</div>
              <div class="chips">
                <span class="chip status completed">Completed</span>
                <span class="chip budget" *ngIf="p.usedBudget != null">{{ (p.usedBudget || 0) | number }}/{{ p.budget | number }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section { padding: 1rem; display: grid; gap: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .board { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; }
    @media (max-width: 960px) { .board { grid-template-columns: 1fr; } }
    .lane { display: grid; gap: .5rem; }
    .list { min-height: 300px; display: grid; gap: .5rem; padding: .5rem; border-radius: .75rem; background: rgba(0,0,0,0.04); transition: background .2s ease; }
    .card { padding: .5rem .75rem; border-radius: .75rem; background: rgba(255,255,255,0.6); backdrop-filter: blur(8px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); cursor: grab; transition: transform .2s ease, box-shadow .2s ease; }
    .title { font-weight: 600; }
    .meta { font-size: .85rem; opacity: .7; }
    .chips { display: flex; gap: .25rem; margin-top: .25rem; flex-wrap: wrap; }
    .chip { padding: .1rem .5rem; border-radius: 9999px; font-size: .75rem; }
    .chip.status.planned { background: #e0f2fe; color: #075985; }
    .chip.status.ongoing { background: #dcfce7; color: #166534; }
    .chip.status.completed { background: #ede9fe; color: #5b21b6; }
    .chip.budget { background: rgba(0,0,0,0.06); }
  `]
})
export class ProjectsBoardComponent {
  planned: Project[] = [];
  ongoing: Project[] = [];
  completed: Project[] = [];

  constructor(private readonly projects: ProjectsService) {
    this.refresh();
  }

  private refresh() {
    const all = this.projects.list();
    this.planned = all.filter((p: any) => p.status === 'Planned');
    this.ongoing = all.filter((p: any) => p.status === 'Ongoing');
    this.completed = all.filter((p: any) => p.status === 'Completed');
  }

  drop(event: CdkDragDrop<Project[]>, newStatus: 'Planned'|'Ongoing'|'Completed') {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    // Update project status in service for the dropped item
    const moved = event.container.data[event.currentIndex];
    if (moved && moved.id) {
      this.projects.update(moved.id, { status: newStatus });
    }
    this.refresh();
  }
}
