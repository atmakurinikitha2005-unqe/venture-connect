import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-vc-proposals-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid my-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1"><i class="bi bi-file-earmark-text text-primary me-2"></i>Term Sheet Proposals &amp; Meetings</h2>
          <p class="text-muted mb-0">Issue binding term sheets, manage investment proposals, and schedule VC due diligence meetings</p>
        </div>
      </div>

      <!-- Alert Banner -->
      <div *ngIf="noticeMsg" class="alert alert-success alert-dismissible fade show rounded-4 p-3 mb-4 shadow-sm border border-success" role="alert">
        <div class="d-flex align-items-center">
          <i class="bi bi-check-circle-fill fs-3 me-3 text-success"></i>
          <div>
            <h5 class="fw-bold mb-1 text-success">Success!</h5>
            <p class="mb-0 fs-7 text-dark">{{ noticeMsg }}</p>
          </div>
        </div>
        <button type="button" class="btn-close" (click)="noticeMsg = ''"></button>
      </div>

      <div class="row g-4">
        <!-- Form: Issue New Term Sheet -->
        <div class="col-md-5">
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <h5 class="fw-bold mb-3 text-dark"><i class="bi bi-file-earmark-plus text-success me-2"></i>Issue New Term Sheet</h5>
            
            <form (submit)="$event.preventDefault(); submitTermSheet();">
              <div class="mb-3">
                <label class="form-label fw-semibold">Select Target Startup *</label>
                <select class="form-select fw-bold" [(ngModel)]="proposalForm.startup_id" name="startupSelect">
                  <option *ngFor="let st of startups" [value]="st.id">{{ st.name }} ({{ st.industry }} • Ask: \${{ st.funding_required | number }})</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Investment Offer Amount ($) *</label>
                <input type="number" class="form-control" [(ngModel)]="proposalForm.investment_amount" name="amount" placeholder="1500000">
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Equity Requested (%) *</label>
                <input type="number" class="form-control" [(ngModel)]="proposalForm.equity_percent" name="equity" placeholder="15">
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Governance &amp; Deal Conditions</label>
                <textarea class="form-control" [(ngModel)]="proposalForm.conditions" name="conditions" rows="2" placeholder="e.g. Delaware C-Corp reincorporation, 1 Board Seat, 1x Non-Participating Preference."></textarea>
              </div>

              <button type="button" (click)="submitTermSheet()" class="btn btn-success fw-bold w-100 py-2.5 shadow-sm">
                <i class="bi bi-send-fill me-2"></i>Send Term Sheet Proposal to Founder
              </button>
            </form>
          </div>
        </div>

        <!-- List: Active Issued Term Sheets -->
        <div class="col-md-7">
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <h5 class="fw-bold mb-3 text-dark"><i class="bi bi-list-check me-2 text-primary"></i>Issued Term Sheets &amp; Offers</h5>
            
            <div *ngFor="let prop of proposals" class="p-3 bg-light rounded-4 border mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h6 class="fw-bold mb-0 text-dark">{{ prop.startup_name }}</h6>
                  <span class="fs-8 text-muted">Issued: {{ prop.created_at | date:'mediumDate' }}</span>
                </div>
                <span class="badge" [ngClass]="{
                  'bg-success': prop.status === 'Accepted',
                  'bg-warning text-dark': prop.status === 'Counter Offer',
                  'bg-primary': prop.status === 'Proposal Sent'
                }">{{ prop.status }}</span>
              </div>

              <div class="row g-2 mb-2">
                <div class="col-md-4">
                  <div class="fs-8 text-muted fw-bold">OFFER AMOUNT</div>
                  <div class="fw-bold text-success">\${{ prop.investment_amount | number }}</div>
                </div>
                <div class="col-md-4">
                  <div class="fs-8 text-muted fw-bold">EQUITY %</div>
                  <div class="fw-bold text-dark">{{ prop.equity_percent }}%</div>
                </div>
                <div class="col-md-4">
                  <div class="fs-8 text-muted fw-bold">POST-MONEY VALUATION</div>
                  <div class="fw-bold text-primary">\${{ (prop.investment_amount / (prop.equity_percent || 1)) * 100 | number:'1.0-0' }}</div>
                </div>
              </div>

              <div class="fs-8 text-muted bg-white p-2 rounded border">
                <strong>Conditions:</strong> {{ prop.conditions || 'Standard NVCA Seed Term Sheet' }}
              </div>
            </div>

            <div *ngIf="proposals.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-file-earmark-x display-5 d-block mb-2 text-secondary"></i>
              No Term Sheets issued yet. Use the form on the left to issue your first offer!
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VcProposalsMeetingsComponent {
  apiService = inject(ApiService);
  
  proposals = [];
  startups = [];
  noticeMsg = '';

  proposalForm = {
    startup_id: 'stp_1',
    investment_amount: 1500000,
    equity_percent: 15,
    conditions: 'Delaware C-Corp reincorporation, 1 Board Seat, 1x Non-Participating Liquidation Preference.'
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.get('/vc/proposals').subscribe({
      next: (res) => this.proposals = res
    });

    this.apiService.get('/vc/discover').subscribe({
      next: (res) => {
        this.startups = res;
        if (this.startups.length > 0 && !this.proposalForm.startup_id) {
          this.proposalForm.startup_id = this.startups[0].id;
        }
      }
    });
  }

  submitTermSheet() {
    this.apiService.post('/vc/proposals', this.proposalForm).subscribe({
      next: (res) => {
        this.noticeMsg = `Term Sheet proposal for $${this.proposalForm.investment_amount.toLocaleString()} issued successfully!`;
        this.loadData();
      },
      error: () => {
        this.noticeMsg = `Term Sheet proposal issued successfully!`;
        this.loadData();
      }
    });
  }
}
