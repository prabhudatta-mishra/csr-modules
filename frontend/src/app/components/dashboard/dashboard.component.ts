import { Component, signal, effect, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { ProjectsService } from '../../projects.service';
import { EmployeesService } from '../../employees.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSnackBarModule, MatChipsModule, MatFormFieldModule, MatInputModule, NgxChartsModule],
  template: `
    <div class="section">
      <h2>Dashboard</h2>
      <div class="status">
        <mat-chip [color]="online() ? 'primary' : 'warn'" selected>
          {{ online() ? 'Online' : 'Offline' }}
        </mat-chip>
      </div>

      <div class="kpis">
        <mat-card appearance="outlined" class="kpi">
          <mat-card-title>Total Projects</mat-card-title>
          <mat-card-content><div class="kpi-value">{{ totalProjects() }}</div></mat-card-content>
        </mat-card>
        <mat-card appearance="outlined" class="kpi">
          <mat-card-title>Volunteers</mat-card-title>
          <mat-card-content><div class="kpi-value">{{ totalVolunteers() }}</div></mat-card-content>
        </mat-card>
        <mat-card appearance="outlined" class="kpi">
          <mat-card-title>Total Budget</mat-card-title>
          <mat-card-content><div class="kpi-value">{{ totalBudget() | number }}</div></mat-card-content>
        </mat-card>
      </div>

      <div class="grid">
        <mat-card appearance="outlined" class="hoverable">
          <mat-card-title>Monthly CSR Spending</mat-card-title>
          <mat-card-content>
            <div #chartContainer class="chart-container">
            <ngx-charts-line-chart
              [view]="chartView"
              [results]="spendingData"
              [scheme]="colorScheme"
              [gradient]="true"
              [xAxis]="true"
              [yAxis]="true"
              [legend]="false"
              [showXAxisLabel]="true"
              [showYAxisLabel]="true"
              [xAxisLabel]="'Month'"
              [yAxisLabel]="'Budget Used'"
              [animations]="true">
            </ngx-charts-line-chart>
            </div>
          </mat-card-content>
        </mat-card>

        
      </div>
    </div>
  `,
  styles: [`
    .section { padding: 1rem; display: grid; gap: 1rem; }
    .status { margin-bottom: .25rem; }
    .kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .75rem; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
    @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
    @media (max-width: 960px) { .kpis { grid-template-columns: 1fr; } }
    .kpi { display: grid; align-content: center; }
    .kpi-value { font-size: 1.85rem; font-weight: 600; }
    .chart-container { width: 100%; display: block; }
    :host ::ng-deep ngx-charts-line-chart { display: block; width: 100%; }
  `]
})
export class DashboardComponent implements AfterViewInit {
  protected readonly online = signal<boolean>(false);
  private timer?: any;
  protected readonly totalProjects = signal<number>(0);
  protected readonly totalVolunteers = signal<number>(0);
  protected readonly totalBudget = signal<number>(0);
  @ViewChild('chartContainer', { static: false }) chartContainer?: ElementRef<HTMLElement>;
  spendingData = [
    {
      name: 'Budget Used',
      series: [
        { name: 'Jan', value: 12000 },
        { name: 'Feb', value: 17500 },
        { name: 'Mar', value: 14200 },
        { name: 'Apr', value: 21000 },
        { name: 'May', value: 18800 },
        { name: 'Jun', value: 22400 },
        { name: 'Jul', value: 20100 },
        { name: 'Aug', value: 23000 },
        { name: 'Sep', value: 19500 },
        { name: 'Oct', value: 24500 },
        { name: 'Nov', value: 26000 },
        { name: 'Dec', value: 28000 },
      ]
    }
  ];
  ngAfterViewInit(): void {
    // Make chart fit its container
    const el = this.chartContainer?.nativeElement;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth || 700;
      this.chartView = [Math.max(360, w), this.chartView[1]];
    };
    // Initial
    update();
    // Observe
    this.resizeObs = new ResizeObserver(() => this.zone.run(update));
    this.resizeObs.observe(el);
  }
  colorScheme: any = { domain: ['#0ea5e9', '#22c55e', '#f59e0b'] };
  chartView: [number, number] = [700, 380];
  private resizeObs?: ResizeObserver;
 

  constructor(private readonly http: HttpClient, private readonly snack: MatSnackBar, private readonly projects: ProjectsService, private readonly employees: EmployeesService, private readonly zone: NgZone) {
    effect(() => {
      const ps = this.projects.projects();
      const es = this.employees.employees();
      this.totalProjects.set(ps.length);
      this.totalVolunteers.set(es.length);
      this.totalBudget.set(ps.reduce((sum: number, p: any) => sum + (p.budget || 0), 0));
    });
  }

  // Connectivity test removed per request; health chip remains.

  ngOnInit() {
    this.online.set(true);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.resizeObs) this.resizeObs.disconnect();
  }
}
