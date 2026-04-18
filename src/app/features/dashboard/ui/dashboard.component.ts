import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthFacade } from '../../auth/application/auth.facade';

@Component({
     selector: 'app-dashboard',
     imports: [MatButtonModule, MatIconModule],
     template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Krishika Pro</h1>
        <button mat-icon-button (click)="onLogout()" aria-label="Sign out">
          <mat-icon>logout</mat-icon>
        </button>
      </header>
      <main class="dashboard-content">
        <p>Welcome, {{ user()?.fullName ?? 'Farmer' }}!</p>
        <p class="coming-soon">Dashboard features coming soon…</p>
      </main>
    </div>
  `,
     styles: `
    .dashboard {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background: #fafdf6;
    }
    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #2e7d32;
      color: #fff;
    }
    h1 { margin: 0; font-size: 1.25rem; }
    .dashboard-content {
      padding: 24px 16px;
      text-align: center;
    }
    .coming-soon { color: #79747e; font-size: 0.9rem; }
  `,
})
export class DashboardComponent {
     private readonly authFacade = inject(AuthFacade);
     private readonly router = inject(Router);

     readonly user = this.authFacade.user;

     async onLogout(): Promise<void> {
          await this.authFacade.logout();
          await this.router.navigate(['/auth/login']);
     }
}
