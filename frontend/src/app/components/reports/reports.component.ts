import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
// Chart.js removed; using ngx-charts + html2canvas for exports

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, NgxChartsModule],
  template: `
    <div class="section">
      <h2>Reports</h2>
      <mat-card appearance="outlined" #reportCard>
        <mat-card-header>
          <mat-card-title>Participation</mat-card-title>
          <mat-card-subtitle>Filter by date range</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>From</mat-label>
              <input matInput [matDatepicker]="fromPicker" (dateChange)="onRangeChange($event)">
              <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>To</mat-label>
              <input matInput [matDatepicker]="toPicker" (dateChange)="onRangeChange($event)">
              <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>
            <div class="actions">
              <button mat-stroked-button color="primary" (click)="exportCsv()">Export CSV</button>
            </div>
          </div>

          <mat-tab-group>
            <mat-tab label="Bar">
              <ngx-charts-bar-vertical
                [results]="barResults"
                [scheme]="colorScheme"
                [xAxis]="true" [yAxis]="true" [gradient]="true"
                [animations]="true" [roundEdges]="true">
              </ngx-charts-bar-vertical>
              <div class="drilldown" *ngIf="barResults?.length">
                <span>Quick filter Projects by:</span>
                <button mat-button *ngFor="let r of barResults" (click)="gotoFilter(r.name)">{{ r.name }}</button>
              </div>
            </mat-tab>
            <mat-tab label="Line">
              <ngx-charts-line-chart
                [results]="lineResults"
                [scheme]="colorScheme"
                [xAxis]="true" [yAxis]="true" [gradient]="true"
                [legend]="false" [showXAxisLabel]="true" [showYAxisLabel]="true"
                [xAxisLabel]="'Month'" [yAxisLabel]="'Participants'">
              </ngx-charts-line-chart>
            </mat-tab>
            <mat-tab label="Pie">
              <ngx-charts-pie-chart
                [results]="pieResults"
                [scheme]="colorScheme"
                [labels]="true" [doughnut]="true"
                [gradient]="true">
              </ngx-charts-pie-chart>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .section { padding: 1rem; display: grid; gap: 1rem; }
    .filters { display: flex; gap: .75rem; margin-bottom: .75rem; align-items: center; flex-wrap: wrap; }
    .filters .actions { display: flex; gap: .5rem; }
    .drilldown { display: flex; gap: .25rem; flex-wrap: wrap; align-items: center; margin-top: .5rem; }
  `]
})
export class ReportsComponent {
  @ViewChild('reportCard') reportCard?: ElementRef;
  // ngx-charts datasets
  colorScheme: any = { domain: ['#0ea5e9', '#22c55e', '#f59e0b', '#a78bfa'] };
  barResults = [
    { name: 'Jan', value: 12 },
    { name: 'Feb', value: 19 },
    { name: 'Mar', value: 7 },
    { name: 'Apr', value: 15 },
    { name: 'May', value: 22 },
    { name: 'Jun', value: 9 },
    { name: 'Jul', value: 14 },
    { name: 'Aug', value: 17 },
    { name: 'Sep', value: 11 },
    { name: 'Oct', value: 20 },
    { name: 'Nov', value: 23 },
    { name: 'Dec', value: 26 },
  ];
  lineResults = [
    {
      name: 'Participation',
      series: [
        { name: 'Jan', value: 10 },
        { name: 'Feb', value: 12 },
        { name: 'Mar', value: 9 },
        { name: 'Apr', value: 14 },
        { name: 'May', value: 18 },
        { name: 'Jun', value: 16 },
        { name: 'Jul', value: 15 },
        { name: 'Aug', value: 19 },
        { name: 'Sep', value: 13 },
        { name: 'Oct', value: 21 },
        { name: 'Nov', value: 24 },
        { name: 'Dec', value: 27 }
      ]
    }
  ];
  pieResults = [
    { name: 'Participants', value: 84 },
    { name: 'Completed', value: 39 },
  ];

  onRangeChange(_: MatDatepickerInputEvent<Date>) {
    // Demo: no real filtering; could re-calc datasets based on range
  }

  async downloadPng() {
    const el = this.reportCard?.nativeElement as HTMLElement | undefined;
    if (!el) return;
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(el, { scale: 2 });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.png';
    a.click();
  }

  exportCsv() {
    // Export current bar dataset as CSV fallback; extend per selected tab as needed
    const labels = this.barResults.map(r => r.name);
    const rows: string[] = [];
    const header = ['Label', 'Value'];
    rows.push(header.join(','));
    for (let i = 0; i < labels.length; i++) {
      const row = [labels[i], String(this.barResults[i]?.value ?? 0)];
      rows.push(row.join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  constructor(private readonly router: Router) {}

  gotoFilter(label: string) {
    this.router.navigate(['/projects'], { queryParams: { q: label } });
  }

  async exportPdf() {
    const cardEl = this.reportCard?.nativeElement as HTMLElement | undefined;
    if (!cardEl) return;
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf') as any
    ]);
    const canvas = await html2canvas(cardEl, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = { w: pageWidth - 20, h: ((pageWidth - 20) / canvas.width) * canvas.height };
    const y = 10;
    pdf.addImage(imgData, 'PNG', 10, y, imgProps.w, Math.min(imgProps.h, pageHeight - 20));
    pdf.save('report.pdf');
  }

  async exportExcel() {
    const xlsx = await import('xlsx');
    const rows = this.barResults.map(r => ({ Label: r.name, Value: r.value }));
    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Chart');
    xlsx.writeFile(wb, 'report.xlsx');
  }
}
