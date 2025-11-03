import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/auth/login.component';
import { authGuard, adminGuard, verifiedGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'verify', loadComponent: () => import('./components/auth/verify.component').then(m => m.VerifyComponent) },
  { path: 'dashboard', canActivate: [authGuard, verifiedGuard], component: DashboardComponent },
  { path: 'events', canActivate: [authGuard, verifiedGuard], loadComponent: () => import('./components/events/events.component').then(m => m.EventsComponent) },
  { path: 'projects', canActivate: [adminGuard], loadComponent: () => import('./components/projects/projects.component').then(m => m.ProjectsComponent) },
  { path: 'projects/grid', canActivate: [adminGuard], loadComponent: () => import('./components/projects/projects-grid.component').then(m => m.ProjectsGridComponent) },
  { path: 'projects/board', canActivate: [adminGuard], loadComponent: () => import('./components/projects/projects-board.component').then(m => m.ProjectsBoardComponent) },
  { path: 'employees', canActivate: [adminGuard], loadComponent: () => import('./components/employees/employees.component').then(m => m.EmployeesComponent) },
  { path: 'volunteers', canActivate: [adminGuard], loadComponent: () => import('./components/volunteers/volunteers-cards.component').then(m => m.VolunteersCardsComponent) },
  { path: 'reports', canActivate: [adminGuard], loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent) },
  { path: 'my-projects', canActivate: [authGuard, verifiedGuard], loadComponent: () => import('./components/my-projects/my-projects.component').then(m => m.MyProjectsComponent) },
  
  { path: '**', redirectTo: 'login' }
];
