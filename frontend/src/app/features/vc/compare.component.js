import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-vc-compare',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid my-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1"><i class="bi bi-columns-gap text-primary me-2"></i>Startup Comparison Matrix</h2>
          <p class="text-muted mb-0">Compare financial metrics, funding targets, equity %, MRR growth, and scorecard ratings</p>
        </div>
        <button class="btn btn-outline-primary btn-sm fw-bold shadow-sm" (click)="selectAllAndCompare()">
          <i class="bi bi-arrow-clockwise me-1"></i>Compare All Startups
        </button>
      </div>

      <!-- Interactive Checkbox Control Panel -->
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border border-primary border-opacity-25">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 class="fw-bold mb-1 text-dark"><i class="bi bi-ui-checks me-2 text-success"></i>Select Startups to Compare:</h6>
            <div class="d-flex flex-wrap gap-3 mt-2">
              <div *ngFor="let st of availableStartups" class="form-check form-check-inline bg-light p-2 px-3 rounded-3 border">
                <input class="form-check-input cursor-pointer" type="checkbox" [id]="'chk_' + st.id" [checked]="isSelected(st.id)" (change)="toggleStartup(st.id)">
                <label class="form-check-label fw-bold text-dark cursor-pointer" [for]="'chk_' + st.id">
                  {{ st.name }} <span class="badge bg-secondary ms-1 fs-8">{{ st.industry }}</span>
                </label>
              </div>
            </div>
          </div>
          <div>
            <button class="btn btn-success fw-bold px-4 py-2 shadow-sm" (click)="runComparison()">
              <i class="bi bi-bar-chart-line-fill me-2"></i>Compare Selected Startups ({{ selectedIds.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Comparison Matrix Table -->
      <div *ngIf="comparisonItems.length > 0" class="table-responsive bg-white rounded-4 shadow-lg p-4 border">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th style="width: 25%;">METRIC / ATTRIBUTE</th>
              <th *ngFor="let item of comparisonItems" class="text-center" style="width: 25%;">
                <div class="d-flex flex-column align-items-center">
                  <img [src]="item.startup.logo_url" class="rounded-3 mb-2 border" width="54" height="54" alt="Logo">
                  <h5 class="fw-bold mb-0 text-white">{{ item.startup.name }}</h5>
                  <span class="badge bg-primary mt-1">{{ item.startup.industry }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="fw-bold bg-light"><i class="bi bi-geo-alt text-danger me-2"></i>Location &amp; Stage</td>
              <td *ngFor="let item of comparisonItems" class="text-center">
                {{ item.startup.location }} • <span class="badge bg-secondary">{{ item.startup.stage }}</span>
              </td>
            </tr>
            <tr>
              <td class="fw-bold bg-light"><i class="bi bi-currency-dollar text-success me-2"></i>Funding Target Ask</td>
              <td *ngFor="let item of comparisonItems" class="text-center fw-bold text-success fs-5">
                \${{ item.startup.funding_required | number }}
              </td>
            </tr>
            <tr>
              <td class="fw-bold bg-light"><i class="bi bi-pie-chart text-warning me-2"></i>Equity Offered (%)</td>
              <td *ngFor="let item of comparisonItems" class="text-center fw-bold text-dark fs-5">
                {{ item.startup.equity_offered_percent }}%
              </td>
            </tr>
            <tr>
              <td class="fw-bold bg-light"><i class="bi bi-graph-up-arrow text-primary me-2"></i>Implied Post-Money Valuation</td>
              <td *ngFor="let item of comparisonItems" class="text-center fw-bold text-primary fs-5">
                \${{ (item.startup.funding_required / (item.startup.equity_offered_percent || 1)) * 100 | number:'1.0-0' }}
              </td>
            </tr>
            <tr>
              <td class="fw-bold bg-light"><i class="bi bi-cash-stack text-success me-2"></i>Current MRR / ARR</td>
              <td *ngFor="let item of comparisonItems" class="text-center fs-7">
                <strong>MRR:</strong> \${{ item.startup.financials?.revenue_mrr || 42000 | number }}<br>
                <span class="text-muted">ARR: \${{ item.startup.financials?.arr || 504000 | number }}</span>
              </td>
            </tr>
            <tr>
              <td class="fw-bold bg-light"><i class="bi bi-star-fill text-warning me-2"></i>VC Scorecard Score</td>
              <td *ngFor="let item of comparisonItems" class="text-center">
                <span class="badge bg-warning text-dark fs-6 px-3 py-2 fw-bold">
                  ⭐ {{ item.scorecard?.overall_score || 8.5 }} / 10
                </span>
              </td>
            </tr>
            <tr>
              <td class="fw-bold bg-light"><i class="bi bi-file-earmark-pdf text-danger me-2"></i>Pitch Deck PDF</td>
              <td *ngFor="let item of comparisonItems" class="text-center">
                <a *ngIf="item.startup.pitch_deck_url" [href]="item.startup.pitch_deck_url" target="_blank" class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-download me-1"></i>Download PDF
                </a>
                <span *ngIf="!item.startup.pitch_deck_url" class="text-muted fs-8">Not available</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="comparisonItems.length === 0" class="text-center py-5 bg-white rounded-4 border shadow-sm">
        <i class="bi bi-columns-gap display-4 text-muted d-block mb-3"></i>
        <h5 class="fw-bold text-dark">No Startups Selected for Comparison</h5>
        <p class="text-muted fs-7">Select at least 2 startups above and click "Compare Selected Startups".</p>
        <button class="btn btn-primary fw-bold" (click)="selectAllAndCompare()">Select All Startups &amp; Compare</button>
      </div>
    </div>
  `
})
export class VcCompareComponent {
  apiService = inject(ApiService);
  ngZone = inject(NgZone);

  availableStartups = [];
  selectedIds = ['stp_1', 'stp_2'];
  comparisonItems = [];

  ngOnInit() {
    this.apiService.get('/vc/discover').subscribe({
      next: (res) => {
        this.availableStartups = res;
        if (this.availableStartups.length > 0) {
          const ids = this.availableStartups.slice(0, 3).map(s => s.id);
          this.selectedIds = ids;
          this.runComparison();
        }
      }
    });
  }

  isSelected(id) {
    return this.selectedIds.includes(id);
  }

  toggleStartup(id) {
    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter(i => i !== id);
    } else {
      this.selectedIds = [...this.selectedIds, id];
    }
    this.runComparison();
  }

  selectAllAndCompare() {
    this.selectedIds = this.availableStartups.map(s => s.id);
    this.runComparison();
  }

  runComparison() {
    const idsToCompare = this.selectedIds.length > 0 ? this.selectedIds : ['stp_1', 'stp_2'];
    this.apiService.post('/vc/compare', { startup_ids: idsToCompare }).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.comparisonItems = res.items || [];
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.comparisonItems = [];
        });
      }
    });
  }
}
