import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav *ngIf="authService.currentUser()" class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold text-white fs-5" routerLink="/">
          <i class="bi bi-rocket-takeoff-fill me-2 text-primary"></i>VentureConnect
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navMenu">
          <!-- Entrepreneur Navigation -->
          <ul *ngIf="authService.userRole === 'entrepreneur'" class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/entrepreneur" routerLinkActive="active">
                <i class="bi bi-speedometer2 me-1"></i>Entrepreneur Hub
              </a>
            </li>
          </ul>

          <!-- VC Investor Navigation -->
          <ul *ngIf="authService.userRole === 'vc'" class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/vc/discover" routerLinkActive="active">
                <i class="bi bi-compass me-1"></i>Discover Startups
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/vc/compare" routerLinkActive="active">
                <i class="bi bi-columns-gap me-1"></i>Compare
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/vc/pipeline" routerLinkActive="active">
                <i class="bi bi-kanban me-1"></i>Dealflow Pipeline
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/vc/due-diligence" routerLinkActive="active">
                <i class="bi bi-check2-square me-1"></i>Due Diligence
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/vc/proposals" routerLinkActive="active">
                <i class="bi bi-file-earmark-text me-1"></i>Proposals &amp; Meetings
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/vc/portfolio" routerLinkActive="active">
                <i class="bi bi-briefcase me-1"></i>Portfolio
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-warning fw-bold" routerLink="/vc/graph" routerLinkActive="active">
                <i class="bi bi-diagram-3 me-1"></i>Graph Explorer
              </a>
            </li>
          </ul>

          <!-- Admin Navigation -->
          <ul *ngIf="authService.userRole === 'admin'" class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/admin" routerLinkActive="active">
                <i class="bi bi-shield-lock me-1"></i>Admin Console
              </a>
            </li>
          </ul>

          <!-- Right Side Controls & Demo Role Switcher -->
          <div class="d-flex align-items-center gap-3">
            <div class="dropdown">
              <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-1"></i>Switch Demo Role: <strong>{{ (authService.userRole || 'GUEST') | uppercase }}</strong>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li><a class="dropdown-link cursor-pointer dropdown-item" (click)="switchRole('sarah@novapay.io', 'password123', '/entrepreneur')">🚀 Entrepreneur (Sarah Chen)</a></li>
                <li><a class="dropdown-link cursor-pointer dropdown-item" (click)="switchRole('david@horizoncap.com', 'password123', '/vc/discover')">💼 VC Investor (David Miller)</a></li>
                <li><a class="dropdown-link cursor-pointer dropdown-item" (click)="switchRole('admin@ventureconnect.com', 'admin123', '/admin')">🛡️ Admin (System Admin)</a></li>
              </ul>
            </div>

            <div class="text-white me-2 fs-7">
              {{ authService.currentUser()?.name || 'User' }}
              <span class="badge bg-primary ms-1">{{ authService.userRole || 'guest' }}</span>
            </div>

            <button class="btn btn-danger btn-sm" (click)="logout()">
              <i class="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="container-fluid px-4 py-3">
      <router-outlet></router-outlet>
    </main>

    <footer *ngIf="authService.currentUser()" class="py-3 bg-dark text-white-50 text-center fs-8 mt-5">
      VentureConnect v1.0.0 &copy; 2026 — Full-Stack Web &amp; Graph Database Platform | Built for Wexa AI &amp; VentureConnect
    </footer>
  `
})
export class AppComponent {
  authService = inject(AuthService);
  router = inject(Router);
  ngZone = inject(NgZone);

  switchRole(email, password, route) {
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.router.navigate([route]);
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.router.navigate([route]);
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }
}
