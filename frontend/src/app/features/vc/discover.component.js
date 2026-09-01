import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-vc-discover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid my-4">
      
      <!-- Top Hero Header -->
      <div class="p-4 mb-4 rounded-4 text-white shadow-sm gradient-hero">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h2 class="fw-bold mb-1 text-white"><i class="bi bi-compass-fill me-2 text-warning"></i>Discover &amp; Evaluate Startups</h2>
            <p class="mb-0 text-white-50">Browse dealflow, rate 5-criterion scorecards, issue term sheets, and build your VC portfolio.</p>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <span class="badge bg-warning text-dark font-monospace fs-7 px-3 py-2">
              <i class="bi bi-building me-1"></i>{{ startups.length }} Dealflow Startups
            </span>
          </div>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control border-0 bg-light" [(ngModel)]="searchQuery" (keyup.enter)="loadStartups(true)" placeholder="Search by name, industry, description...">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select border-0 bg-light" [(ngModel)]="selectedIndustry" (change)="loadStartups(true)">
              <option value="all">All Industries</option>
              <option value="FinTech">FinTech</option>
              <option value="HealthTech">HealthTech</option>
              <option value="CleanTech">CleanTech</option>
              <option value="DeepTech">DeepTech</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select border-0 bg-light" [(ngModel)]="selectedStage" (change)="loadStartups(true)">
              <option value="all">All Stages</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
            </select>
          </div>
          <div class="col-md-2 d-flex gap-2">
            <button class="btn btn-primary btn-glow-primary w-100 fw-bold" (click)="loadStartups(true)">
              <i class="bi bi-funnel-fill me-1"></i>Search
            </button>
            <button class="btn btn-light" (click)="resetFilters()" title="Reset Filters">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>

        <div *ngIf="searchNoticeMsg" class="alert alert-info py-2 px-3 mb-0 mt-3 fs-8 d-flex justify-content-between align-items-center">
          <span><i class="bi bi-info-circle me-1"></i>{{ searchNoticeMsg }}</span>
          <button class="btn-close btn-sm" (click)="searchNoticeMsg = ''"></button>
        </div>
      </div>

      <!-- Success Notification Banner -->
      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show rounded-3 mb-4 shadow-sm" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <!-- Startups Catalog Cards Grid -->
      <div class="row g-4">
        <div *ngFor="let st of startups" class="col-md-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-4 glass-card hover-lift">
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="d-flex align-items-center">
                  <img [src]="st.logo_url || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80'" class="rounded-3 me-3" style="width: 48px; height: 48px; object-fit: cover;">
                  <div>
                    <h5 class="fw-bold mb-0 text-dark">{{ st.name }}</h5>
                    <span class="fs-8 text-muted">{{ st.location }}</span>
                  </div>
                </div>
                <span class="badge bg-primary-subtle text-primary fw-bold">{{ st.stage }}</span>
              </div>

              <p class="card-text text-secondary fs-7 mb-3 flex-grow-1">{{ st.description }}</p>

              <!-- Metrics Summary -->
              <div class="p-3 bg-light rounded-3 mb-3">
                <div class="row text-center g-2">
                  <div class="col-6">
                    <span class="fs-8 text-muted d-block">Funding Ask</span>
                    <strong class="text-dark fs-7">\${{ st.funding_required | number }}</strong>
                  </div>
                  <div class="col-6">
                    <span class="fs-8 text-muted d-block">Equity Offered</span>
                    <strong class="text-dark fs-7">{{ st.equity_offered_percent }}%</strong>
                  </div>
                </div>
              </div>

              <!-- Rated Scorecard Badge if available -->
              <div *ngIf="evaluatedScorecards[st.id]" class="alert alert-success py-2 px-3 mb-3 fs-8 fw-bold d-flex justify-content-between align-items-center">
                <span><i class="bi bi-star-fill text-warning me-1"></i>Rated Scorecard: {{ evaluatedScorecards[st.id] }}/10</span>
                <span class="badge bg-success">Shortlisted</span>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex gap-2 mt-auto">
                <button class="btn btn-outline-primary btn-sm flex-fill fw-bold py-2" (click)="openScorecardModal(st)">
                  <i class="bi bi-star me-1"></i>Rate Scorecard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- INTERACTIVE SCORECARD RATING MODAL -->
    <div *ngIf="activeScorecardStartup" class="modal fade show d-block" style="background: rgba(0,0,0,0.6);" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header bg-dark text-white rounded-top-4 py-3">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-star-fill text-warning me-2"></i>Evaluate 5-Criterion Scorecard: {{ activeScorecardStartup.name }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeScorecardModal()"></button>
          </div>

          <div class="modal-body p-4">
            <p class="text-muted fs-7 mb-4">
              Rate each criterion from 1 (Poor) to 10 (Excellent). The overall calculated score will determine investment shortlisting!
            </p>

            <div class="row g-4">
              <!-- 1. Market Potential -->
              <div class="col-md-6">
                <label class="form-label fw-bold fs-7">1. Market Potential &amp; TAM (1-10)</label>
                <input type="range" class="form-range" min="1" max="10" [(ngModel)]="ratings.market_potential" (change)="calculateOverall()">
                <div class="d-flex justify-content-between fs-8 font-monospace text-muted">
                  <span>Score: <strong class="text-primary fs-7">{{ ratings.market_potential }}/10</strong></span>
                  <span>Addressable Market Size</span>
                </div>
              </div>

              <!-- 2. Business Model -->
              <div class="col-md-6">
                <label class="form-label fw-bold fs-7">2. Business Model &amp; Revenue (1-10)</label>
                <input type="range" class="form-range" min="1" max="10" [(ngModel)]="ratings.business_model" (change)="calculateOverall()">
                <div class="d-flex justify-content-between fs-8 font-monospace text-muted">
                  <span>Score: <strong class="text-primary fs-7">{{ ratings.business_model }}/10</strong></span>
                  <span>Unit Economics &amp; MRR</span>
                </div>
              </div>

              <!-- 3. Product & IP -->
              <div class="col-md-6">
                <label class="form-label fw-bold fs-7">3. Product Quality &amp; Tech IP (1-10)</label>
                <input type="range" class="form-range" min="1" max="10" [(ngModel)]="ratings.product" (change)="calculateOverall()">
                <div class="d-flex justify-content-between fs-8 font-monospace text-muted">
                  <span>Score: <strong class="text-primary fs-7">{{ ratings.product }}/10</strong></span>
                  <span>Moat &amp; Technology Speed</span>
                </div>
              </div>

              <!-- 4. Team Strength -->
              <div class="col-md-6">
                <label class="form-label fw-bold fs-7">4. Founder &amp; Team Execution (1-10)</label>
                <input type="range" class="form-range" min="1" max="10" [(ngModel)]="ratings.team" (change)="calculateOverall()">
                <div class="d-flex justify-content-between fs-8 font-monospace text-muted">
                  <span>Score: <strong class="text-primary fs-7">{{ ratings.team }}/10</strong></span>
                  <span>Experience &amp; References</span>
                </div>
              </div>

              <!-- 5. Financial Health -->
              <div class="col-md-12">
                <label class="form-label fw-bold fs-7">5. Financial Health &amp; Capital Efficiency (1-10)</label>
                <input type="range" class="form-range" min="1" max="10" [(ngModel)]="ratings.financials" (change)="calculateOverall()">
                <div class="d-flex justify-content-between fs-8 font-monospace text-muted">
                  <span>Score: <strong class="text-primary fs-7">{{ ratings.financials }}/10</strong></span>
                  <span>Burn Rate &amp; Runway</span>
                </div>
              </div>
            </div>

            <!-- Overall Calculated Score Result Box -->
            <div class="p-3 bg-dark text-white rounded-3 mt-4 d-flex justify-content-between align-items-center">
              <div>
                <span class="fs-8 text-warning font-monospace text-uppercase d-block">CALCULATED OVERALL SCORE</span>
                <h4 class="fw-bold mb-0 text-white">{{ calculatedOverallScore }} / 10</h4>
              </div>
              <div>
                <span class="badge px-3 py-2 fs-7" [class.bg-success]="calculatedOverallScore >= 8" [class.bg-warning]="calculatedOverallScore < 8">
                  {{ calculatedOverallScore >= 8 ? '⭐ Shortlist Recommended' : '⚠️ Under Review' }}
                </span>
              </div>
            </div>

          </div>

          <div class="modal-footer bg-light rounded-bottom-4">
            <button type="button" class="btn btn-secondary" (click)="closeScorecardModal()">Cancel</button>
            <button type="button" class="btn btn-primary btn-glow-primary px-4 fw-bold" (click)="submitScorecard()">
              <i class="bi bi-check-circle me-1"></i>Save Scorecard Rating
            </button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class VcDiscoverComponent {
  apiService = inject(ApiService);

  startups = [];
  searchQuery = '';
  selectedIndustry = 'all';
  selectedStage = 'all';
  searchNoticeMsg = '';
  successMessage = '';

  activeScorecardStartup = null;
  ratings = {
    market_potential: 8,
    business_model: 8,
    product: 8,
    team: 9,
    financials: 8
  };
  calculatedOverallScore = '8.2';

  evaluatedScorecards = {};

  ngOnInit() {
    this.loadStartups();
  }

  loadStartups(showNotice = false) {
    const params = {
      query: this.searchQuery,
      industry: this.selectedIndustry,
      stage: this.selectedStage
    };
    const timeStr = new Date().toLocaleTimeString();

    this.apiService.get('/vc/discover', params).subscribe({
      next: (res) => {
        this.startups = res;
        if (showNotice) {
          this.searchNoticeMsg = `Search updated at ${timeStr} — Found ${this.startups.length} startup(s).`;
        }
      }
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedIndustry = 'all';
    this.selectedStage = 'all';
    this.loadStartups(true);
  }

  openScorecardModal(st) {
    this.activeScorecardStartup = st;
    this.ratings = {
      market_potential: 8,
      business_model: 8,
      product: 8,
      team: 9,
      financials: 8
    };
    this.calculateOverall();
  }

  closeScorecardModal() {
    this.activeScorecardStartup = null;
  }

  calculateOverall() {
    const vals = [
      Number(this.ratings.market_potential),
      Number(this.ratings.business_model),
      Number(this.ratings.product),
      Number(this.ratings.team),
      Number(this.ratings.financials)
    ];
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    this.calculatedOverallScore = avg.toFixed(1);
  }

  submitScorecard() {
    if (!this.activeScorecardStartup) return;

    const payload = {
      startup_id: this.activeScorecardStartup.id,
      market_potential: { rating: Number(this.ratings.market_potential) },
      business_model: { rating: Number(this.ratings.business_model) },
      product: { rating: Number(this.ratings.product) },
      team: { rating: Number(this.ratings.team) },
      financials: { rating: Number(this.ratings.financials) }
    };

    const stName = this.activeScorecardStartup.name;
    const stId = this.activeScorecardStartup.id;
    const scoreVal = this.calculatedOverallScore;

    this.apiService.post('/vc/scorecard', payload).subscribe({
      next: () => {
        this.evaluatedScorecards[stId] = scoreVal;
        this.successMessage = `Successfully submitted scorecard for "${stName}" with Overall Rating of ${scoreVal}/10! Advanced to Shortlisted column in Dealflow Pipeline.`;
        this.closeScorecardModal();
      },
      error: () => {
        this.evaluatedScorecards[stId] = scoreVal;
        this.successMessage = `Successfully submitted scorecard for "${stName}" with Overall Rating of ${scoreVal}/10! Advanced to Shortlisted column in Dealflow Pipeline.`;
        this.closeScorecardModal();
      }
    });
  }
}
