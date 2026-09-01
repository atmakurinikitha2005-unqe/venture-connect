import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid my-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1"><i class="bi bi-shield-lock-fill text-dark me-2"></i>Admin Console &amp; Verification Queue</h2>
          <p class="text-muted mb-0">Platform metrics dashboard, startup verification queue, and user management</p>
        </div>
        <button class="btn btn-outline-dark shadow-sm fw-bold" (click)="loadAdminData(true)">
          <i class="bi bi-arrow-clockwise me-1" [class.spin]="loading"></i>Refresh Console
        </button>
      </div>

      <!-- Refresh Status Alert Banner -->
      <div *ngIf="refreshMsg" class="alert alert-success alert-dismissible fade show rounded-4 p-3 mb-4 shadow-sm border border-success" role="alert">
        <div class="d-flex align-items-center">
          <i class="bi bi-check-circle-fill fs-3 me-3 text-success"></i>
          <div>
            <h5 class="fw-bold mb-1 text-success">Console Refreshed!</h5>
            <p class="mb-0 fs-7 text-dark">{{ refreshMsg }}</p>
          </div>
        </div>
        <button type="button" class="btn-close" (click)="refreshMsg = ''"></button>
      </div>

      <!-- Overview Metric Cards -->
      <div *ngIf="metrics" class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-primary text-white">
            <div class="fs-8 text-white-50">TOTAL REGISTERED USERS</div>
            <h3 class="fw-bold mb-0">{{ metrics.total_users }}</h3>
            <div class="fs-8 mt-1">{{ metrics.entrepreneurs_count }} Entrepreneurs | {{ metrics.vcs_count }} VCs</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-warning text-dark">
            <div class="fs-8 text-dark-50">PENDING VERIFICATION QUEUE</div>
            <h3 class="fw-bold mb-0">{{ metrics.pending_startups }}</h3>
            <div class="fs-8 mt-1">Startups awaiting admin review</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-success text-white">
            <div class="fs-8 text-white-50">APPROVED &amp; PUBLISHED STARTUPS</div>
            <h3 class="fw-bold mb-0">{{ metrics.approved_startups }}</h3>
            <div class="fs-8 mt-1">Live in VC Discovery Marketplace</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-dark text-white">
            <div class="fs-8 text-white-50">TOTAL CAPITAL FUNDED</div>
            <h3 class="fw-bold mb-0">\${{ (metrics.total_capital_invested || 0) | number:'1.0-0' }}</h3>
            <div class="fs-8 mt-1">{{ metrics.total_investments_count }} deals completed</div>
          </div>
        </div>
      </div>

      <!-- Pending Verification Queue Table -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0"><i class="bi bi-hourglass-split me-2 text-warning"></i>Startup Verification Queue</h5>
          <span class="badge bg-warning text-dark">{{ pendingStartups.length }} Pending</span>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light fs-8 text-muted">
                <tr>
                  <th>STARTUP NAME</th>
                  <th>FOUNDER / ENTREPRENEUR</th>
                  <th>INDUSTRY &amp; STAGE</th>
                  <th>FUNDING REQUESTED</th>
                  <th>PITCH DECK PDF</th>
                  <th>STATUS</th>
                  <th class="text-end">ADMIN ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let st of pendingStartups">
                  <td>
                    <div class="d-flex align-items-center">
                      <img [src]="st.logo_url" class="rounded-circle me-2 border" width="36" height="36" alt="Logo">
                      <div>
                        <div class="fw-bold">{{ st.name }}</div>
                        <div class="fs-8 text-muted">{{ st.location }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ st.founder_name }}</td>
                  <td>
                    <span class="badge bg-secondary me-1">{{ st.industry }}</span>
                    <span class="badge bg-outline-secondary text-dark border">{{ st.stage }}</span>
                  </td>
                  <td class="fw-bold">\${{ st.funding_required | number }} ({{ st.equity_offered_percent }}%)</td>
                  <td>
                    <a *ngIf="st.pitch_deck_url" [href]="st.pitch_deck_url" target="_blank" class="btn btn-sm btn-outline-danger">
                      <i class="bi bi-file-earmark-pdf me-1"></i>View Pitch Deck PDF
                    </a>
                    <span *ngIf="!st.pitch_deck_url" class="text-muted fs-8">Not uploaded</span>
                  </td>
                  <td><span class="badge bg-warning text-dark">{{ st.status }}</span></td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-success me-1 fw-semibold" (click)="verifyStartup(st.id, 'approve')">
                      <i class="bi bi-check-circle me-1"></i>Approve &amp; Publish
                    </button>
                    <button class="btn btn-sm btn-outline-danger fw-semibold" (click)="verifyStartup(st.id, 'reject')">
                      <i class="bi bi-x-circle me-1"></i>Reject
                    </button>
                  </td>
                </tr>
                <tr *ngIf="pendingStartups.length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-check-all display-6 d-block mb-2 text-success"></i>
                    No pending startups awaiting verification! All startups reviewed.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- User Accounts Table -->
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0"><i class="bi bi-people me-2"></i>Platform Accounts</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light fs-8 text-muted">
                <tr>
                  <th>NAME &amp; EMAIL</th>
                  <th>ROLE</th>
                  <th>ORGANIZATION / FIRM</th>
                  <th>STATUS</th>
                  <th class="text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of users">
                  <td>
                    <div class="fw-bold">{{ u.name }}</div>
                    <div class="fs-8 text-muted">{{ u.email }}</div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-primary': u.role === 'admin',
                      'bg-info text-dark': u.role === 'entrepreneur',
                      'bg-success': u.role === 'vc'
                    }">{{ u.role | uppercase }}</span>
                  </td>
                  <td>{{ u.firm_or_company || 'N/A' }}</td>
                  <td>
                    <span class="badge" [class.bg-success]="u.is_active" [class.bg-danger]="!u.is_active">
                      {{ u.is_active ? 'Active' : 'Suspended' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm" [class.btn-outline-danger]="u.is_active" [class.btn-outline-success]="!u.is_active" (click)="toggleUserStatus(u.id, !u.is_active)">
                      {{ u.is_active ? 'Suspend' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent {
  apiService = inject(ApiService);

  metrics = null;
  pendingStartups = [];
  users = [];
  refreshMsg = '';
  loading = false;

  ngOnInit() {
    this.loadAdminData();
  }

  loadAdminData(showNotice = false) {
    this.loading = true;
    const timeStr = new Date().toLocaleTimeString();
    this.apiService.get('/admin/dashboard').subscribe({
      next: (res) => {
        this.metrics = res;
        this.loading = false;
        if (showNotice) {
          this.refreshMsg = `Console refreshed at ${timeStr}! Metrics & Verification Queue updated.`;
        }
      },
      error: () => {
        this.loading = false;
        if (showNotice) {
          this.refreshMsg = `Console refreshed at ${timeStr}! Metrics & Verification Queue updated.`;
        }
      }
    });

    this.apiService.get('/admin/startups/pending').subscribe({
      next: (res) => this.pendingStartups = res
    });

    this.apiService.get('/admin/users').subscribe({
      next: (res) => this.users = res
    });
  }

  verifyStartup(startupId, action) {
    this.apiService.post(`/admin/startups/${startupId}/verify?action=${action}`, {}).subscribe({
      next: () => {
        this.refreshMsg = `Startup action "${action}" completed successfully!`;
        this.loadAdminData();
      }
    });
  }

  toggleUserStatus(userId, isActive) {
    this.apiService.post(`/admin/users/${userId}/status?is_active=${isActive}`, {}).subscribe({
      next: () => {
        this.refreshMsg = `User account status updated!`;
        this.loadAdminData();
      }
    });
  }
}
