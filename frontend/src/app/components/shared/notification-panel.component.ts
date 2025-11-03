import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Notifications</h2>
    <div mat-dialog-content class="content">
      <div *ngIf="!svc.items().length" class="empty">No notifications</div>
      <div class="item" *ngFor="let n of svc.items()">
        <div class="msg">{{ n.message }}</div>
        <div class="meta">{{ n.time | date:'short' }}</div>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="svc.clear()">Clear</button>
      <button mat-stroked-button (click)="svc.markAllRead()">Mark all read</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close()">Close</button>
    </div>
  `,
  styles: [`
    .content { display: grid; gap: .5rem; max-height: 60vh; overflow: auto; width: 520px; max-width: 94vw; }
    .item { padding: .5rem .25rem; border-bottom: 1px solid rgba(0,0,0,.06); }
    .msg { font-weight: 500; }
    .meta { font-size: .8rem; opacity: .7; }
    .empty { opacity: .7; padding: .5rem; }
  `]
})
export class NotificationPanelComponent {
  constructor(public readonly svc: NotificationService, public dialogRef: MatDialogRef<NotificationPanelComponent>) {}
}
