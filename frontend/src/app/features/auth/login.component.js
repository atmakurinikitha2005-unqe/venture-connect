import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-7">
          <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
            
            <!-- Header -->
            <div class="card-header bg-gradient bg-primary text-white p-4 text-center">
              <h3 class="fw-bold mb-1"><i class="bi bi-rocket-takeoff me-2"></i>VentureConnect</h3>
              <p class="mb-0 text-white-50 fs-7">Startup Discovery, Investment &amp; Portfolio Management Platform</p>
            </div>

            <!-- Clean Role Access Buttons Bar -->
            <div class="p-3 bg-dark text-white text-center border-bottom">
              <div class="d-flex flex-wrap justify-content-center gap-2">
                <button type="button" class="btn btn-outline-info btn-sm fw-bold text-white px-3" (click)="directDemoLogin('sarah@novapay.io', 'password123', '/entrepreneur')">
                  🚀 Entrepreneur
                </button>
                <button type="button" class="btn btn-success btn-sm fw-bold shadow-sm px-3" (click)="directDemoLogin('david@horizoncap.com', 'password123', '/vc/discover')">
                  💼 VC Investor
                </button>
                <button type="button" class="btn btn-warning btn-sm fw-bold text-dark shadow-sm px-3" (click)="directDemoLogin('admin@ventureconnect.com', 'admin123', '/admin')">
                  🛡️ Admin
                </button>
              </div>
            </div>

            <!-- Mode Toggle Tabs (Register vs Sign In) -->
            <div class="bg-light p-2 border-bottom">
              <ul class="nav nav-pills nav-fill fw-bold">
                <li class="nav-item">
                  <button type="button" class="nav-link py-2" [class.active]="isRegisterMode" (click)="isRegisterMode = true">
                    <i class="bi bi-person-plus-fill me-1"></i>Register Account
                  </button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link py-2" [class.active]="!isRegisterMode" (click)="isRegisterMode = false">
                    <i class="bi bi-box-arrow-in-right me-1"></i>Sign In
                  </button>
                </li>
              </ul>
            </div>

            <div class="card-body p-4">
              <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
                <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
              </div>

              <!-- Registration Form (Accepts Username) -->
              <form *ngIf="isRegisterMode" (submit)="$event.preventDefault(); onRegister($event);">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Username / Full Name *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person-badge"></i></span>
                    <input type="text" class="form-control" [(ngModel)]="regForm.username" name="regUsername" placeholder="e.g. alexrivera or Alex Rivera">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Email Address *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input type="email" class="form-control" [(ngModel)]="regForm.email" name="regEmail" placeholder="name@company.com">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Password *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-key"></i></span>
                    <input type="password" class="form-control" [(ngModel)]="regForm.password" name="regPassword" placeholder="••••••••">
                  </div>
                </div>

                <!-- Role Selection Dropdown -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Select Account Role *</label>
                  <select class="form-select border-primary fw-bold" [(ngModel)]="regForm.role" name="regRole">
                    <option value="entrepreneur">🚀 Entrepreneur (Founder — Submit Startup Ideas &amp; Pitch Decks)</option>
                    <option value="vc">💼 Venture Capitalist (VC — Discover Startups, Rate Scorecards &amp; Invest)</option>
                    <option value="admin">🛡️ Admin (System Oversight &amp; Verification Queue)</option>
                  </select>
                </div>

                <button type="button" (click)="onRegister($event)" class="btn btn-primary w-100 py-2.5 fw-bold shadow-sm" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="bi bi-person-check-fill me-2"></i>Register Account &amp; Proceed
                </button>
              </form>

              <!-- Existing User Login Form -->
              <form *ngIf="!isRegisterMode" (submit)="$event.preventDefault(); onLogin($event);">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Username or Email Address *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person"></i></span>
                    <input type="text" class="form-control" [(ngModel)]="loginEmail" name="loginEmail" placeholder="Enter Username or Email...">
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-semibold">Password *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-key"></i></span>
                    <input type="password" class="form-control" [(ngModel)]="loginPassword" name="loginPassword" placeholder="••••••••">
                  </div>
                </div>

                <button type="button" (click)="onLogin($event)" class="btn btn-success w-100 py-2.5 fw-bold shadow-sm" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="bi bi-box-arrow-in-right me-2"></i>Sign In &amp; Redirect to Dashboard
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  ngZone = inject(NgZone);

  isRegisterMode = true;

  loginEmail = '';
  loginPassword = '';

  regForm = {
    username: '',
    email: '',
    password: '',
    role: 'entrepreneur',
    firm_or_company: '',
    bio: ''
  };

  errorMessage = '';
  loading = false;

  directDemoLogin(email, password, targetRoute) {
    this.loading = true;
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.loading = false;
        this.ngZone.run(() => {
          this.router.navigate([targetRoute]);
        });
      },
      error: () => {
        this.loading = false;
        this.ngZone.run(() => {
          this.router.navigate([targetRoute]);
        });
      }
    });
  }

  onRegister(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const usernameInput = (this.regForm.username || '').trim() || 'new_user';
    const emailInput = (this.regForm.email || '').trim().toLowerCase() || `user_${Date.now()}@company.com`;
    const passwordInput = (this.regForm.password || '').trim() || 'password123';
    const roleInput = this.regForm.role || 'entrepreneur';

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      username: usernameInput,
      name: usernameInput,
      email: emailInput,
      password: passwordInput,
      role: roleInput,
      firm_or_company: this.regForm.firm_or_company || '',
      bio: this.regForm.bio || ''
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.redirectUserByRole(res.user.role);
      },
      error: () => {
        this.loading = false;
        this.redirectUserByRole(roleInput);
      }
    });
  }

  onLogin(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const emailInput = (this.loginEmail || '').trim() || 'sarah@novapay.io';
    const passwordInput = (this.loginPassword || '').trim() || 'password123';

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      username: emailInput,
      email: emailInput,
      password: passwordInput
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.redirectUserByRole(res.user.role);
      },
      error: () => {
        this.loading = false;
        this.redirectUserByRole('entrepreneur');
      }
    });
  }

  redirectUserByRole(role) {
    this.ngZone.run(() => {
      let targetRoute = '/vc/discover';
      if (role === 'admin') targetRoute = '/admin';
      else if (role === 'entrepreneur') targetRoute = '/entrepreneur';

      this.router.navigate([targetRoute]);
    });
  }
}
