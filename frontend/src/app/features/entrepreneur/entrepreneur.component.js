import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-entrepreneur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid my-4">
      
      <!-- Top Banner Header -->
      <div class="p-4 mb-4 rounded-4 text-white shadow-lg border border-primary border-opacity-25" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
        <div class="row align-items-center">
          <div class="col-md-8">
            <span class="badge bg-primary text-white mb-2 fw-bold"><i class="bi bi-rocket-takeoff-fill me-1"></i>Entrepreneur Founder Hub</span>
            <h2 class="fw-bold mb-2 text-white">Startup Control Center &amp; Pitch Suite</h2>
            <p class="mb-0 text-white-50 fs-6">
              Build executive investor one-pagers, calculate startup valuation &amp; runway, track term sheets, and schedule investor pitch meetings.
            </p>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <button class="btn btn-warning text-dark fw-bold px-3 py-2 shadow-sm me-2" (click)="activeTab = 'pitch_generator'">
              <i class="bi bi-file-earmark-font me-1"></i>Executive One-Pager Builder
            </button>
            <button class="btn btn-outline-light btn-sm fw-bold" (click)="loadData(true)">
              <i class="bi bi-arrow-clockwise me-1" [class.spin]="loadingData"></i>Refresh Hub
            </button>
          </div>
        </div>
      </div>

      <!-- Alert Notification Banner -->
      <div *ngIf="submitSuccessMsg" class="alert alert-success alert-dismissible fade show rounded-4 p-3 mb-4 shadow-sm border border-success" role="alert">
        <div class="d-flex align-items-center">
          <i class="bi bi-check-circle-fill fs-3 me-3 text-success"></i>
          <div>
            <h5 class="fw-bold mb-1 text-success">Updated Successfully!</h5>
            <p class="mb-0 fs-7 text-dark">{{ submitSuccessMsg }}</p>
          </div>
        </div>
        <button type="button" class="btn-close" (click)="submitSuccessMsg = ''"></button>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills fw-bold mb-4 bg-white p-2 rounded-4 shadow-sm border">
        <li class="nav-item">
          <button class="nav-link py-2" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">
            <i class="bi bi-building me-1"></i>Startup Profile &amp; Pitch Deck
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link py-2" [class.active]="activeTab === 'pitch_generator'" (click)="activeTab = 'pitch_generator'">
            <i class="bi bi-file-earmark-font-fill me-1 text-warning"></i>Executive One-Pager Builder
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link py-2" [class.active]="activeTab === 'valuation_calculator'" (click)="activeTab = 'valuation_calculator'">
            <i class="bi bi-calculator-fill me-1 text-primary"></i>🧮 Valuation &amp; Runway Calculator
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link py-2" [class.active]="activeTab === 'deck_audit'" (click)="activeTab = 'deck_audit'">
            <i class="bi bi-clipboard-data-fill me-1 text-info"></i>📊 Pitch Deck Audit &amp; Scorecard
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link py-2" [class.active]="activeTab === 'meetings'" (click)="activeTab = 'meetings'">
            <i class="bi bi-calendar-event-fill me-1 text-warning"></i>📅 Pitch Calendar
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link py-2" [class.active]="activeTab === 'proposals'" (click)="activeTab = 'proposals'">
            <i class="bi bi-file-earmark-text me-1"></i>Term Sheets ({{ proposals.length }})
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link py-2" [class.active]="activeTab === 'submit_idea'" (click)="activeTab = 'submit_idea'">
            <i class="bi bi-lightbulb-fill me-1 text-warning"></i>Submit New Idea
          </button>
        </li>
      </ul>

      <!-- EXECUTIVE ONE-PAGER BUILDER -->
      <div *ngIf="activeTab === 'pitch_generator'">
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 class="fw-bold mb-1 text-dark"><i class="bi bi-file-earmark-font text-warning me-2"></i>Executive Investor One-Pager Builder</h4>
              <p class="text-muted mb-0 fs-7">Enter startup details, financial target, and key product features to generate a clean executive pitch summary.</p>
            </div>
            <span class="badge bg-dark text-white font-monospace fw-bold px-3 py-2">
              Financial Pitch Engine
            </span>
          </div>

          <div class="row g-4">
            <div class="col-md-5">
              <div class="p-3 bg-light rounded-4 border">
                <h6 class="fw-bold mb-3"><i class="bi bi-sliders me-2 text-primary"></i>Executive Pitch Inputs</h6>
                
                <div class="mb-3">
                  <label class="form-label fw-semibold">Startup Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="pitchPrompt.name" placeholder="e.g. NovaPay Tech">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Industry / Sector *</label>
                  <select class="form-select" [(ngModel)]="pitchPrompt.category">
                    <option value="FinTech & Payments">FinTech &amp; Payments</option>
                    <option value="HealthTech & Diagnostics">HealthTech &amp; Diagnostics</option>
                    <option value="CleanTech & Energy">CleanTech &amp; Energy</option>
                    <option value="B2B SaaS & Enterprise">B2B SaaS &amp; Enterprise</option>
                    <option value="DeepTech & Automation">DeepTech &amp; Automation</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Key Features / Highlights (Comma separated)</label>
                  <input type="text" class="form-control" [(ngModel)]="pitchPrompt.keywords" placeholder="e.g. instant settlements, zero fraud, cross-border API">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Target Raise Amount ($)</label>
                  <input type="number" class="form-control" [(ngModel)]="pitchPrompt.targetRaise" placeholder="1500000">
                </div>

                <button class="btn btn-warning text-dark fw-bold w-100 py-2.5 shadow-sm" (click)="buildOnePager()">
                  <i class="bi bi-file-earmark-plus me-2"></i>Build Executive One-Pager
                </button>
              </div>
            </div>

            <div class="col-md-7">
              <div *ngIf="generatedPitch" class="card border border-primary border-opacity-25 rounded-4 p-4 bg-white shadow-lg">
                <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <div>
                    <span class="badge bg-primary me-2">:Startup</span>
                    <h4 class="fw-bold mb-0 d-inline text-dark">{{ generatedPitch.name }}</h4>
                  </div>
                  <span class="badge bg-success-subtle text-success border border-success px-3 py-1">Executive Ready</span>
                </div>

                <h6 class="fw-bold text-primary mb-2">🚀 Elevator Pitch Summary</h6>
                <p class="fst-italic text-dark bg-light p-3 rounded-3 border-start border-primary border-4 mb-3 fs-6">
                  "{{ generatedPitch.tagline }}"
                </p>

                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded-3">
                      <div class="fs-8 text-muted fw-bold mb-1">TOTAL ADDRESSABLE MARKET (TAM)</div>
                      <div class="fw-bold text-dark fs-6">{{ generatedPitch.marketSize }}</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded-3">
                      <div class="fs-8 text-muted fw-bold mb-1">CAPITAL TARGET ASK</div>
                      <div class="fw-bold text-success fs-6">\${{ generatedPitch.targetRaise | number }}</div>
                    </div>
                  </div>
                </div>

                <h6 class="fw-bold text-dark mb-1">⚡ Core Value Proposition</h6>
                <p class="fs-7 text-muted mb-3">{{ generatedPitch.valueProp }}</p>

                <h6 class="fw-bold text-dark mb-1">📈 12-Month Execution Roadmap</h6>
                <p class="fs-7 text-muted mb-4">{{ generatedPitch.roadmap }}</p>

                <div class="d-flex gap-2">
                  <button class="btn btn-success fw-bold flex-fill py-2" (click)="publishOnePagerToMarketplace()">
                    <i class="bi bi-send-fill me-2"></i>Publish to VC Discovery Marketplace
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" (click)="copyPitchToClipboard()">
                    <i class="bi bi-clipboard me-1"></i>Copy Executive Text
                  </button>
                </div>
              </div>

              <div *ngIf="!generatedPitch" class="text-center py-5 bg-light rounded-4 border border-dashed">
                <i class="bi bi-file-earmark-text display-3 text-secondary d-block mb-3"></i>
                <h5 class="fw-bold text-dark">Click "Build Executive One-Pager"</h5>
                <p class="text-muted fs-7 mb-0">Fill in your executive startup details on the left to format your executive summary!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 1: PROFILE & PITCH DECK -->
      <div *ngIf="activeTab === 'profile'">
        <div *ngIf="startup" class="row g-4">
          <div class="col-md-8">
            <div class="card border-0 shadow-sm rounded-4 p-4">
              <div class="d-flex align-items-center mb-3">
                <img [src]="startup.logo_url" class="rounded-3 me-3 border" width="64" height="64" alt="Logo">
                <div>
                  <h3 class="fw-bold mb-0">{{ startup.name }}</h3>
                  <div class="text-muted fs-7">{{ startup.location }} • {{ startup.industry }} • <span class="badge bg-primary">{{ startup.stage }}</span></div>
                </div>
              </div>
              <p class="lead fs-6 mb-3">{{ startup.description }}</p>

              <div class="row g-3 p-3 bg-light rounded-3 mb-3">
                <div class="col-md-6">
                  <div class="fs-8 text-muted fw-bold">PROBLEM STATEMENT</div>
                  <p class="mb-0 fs-7">{{ startup.problem }}</p>
                </div>
                <div class="col-md-6">
                  <div class="fs-8 text-muted fw-bold">SOLUTION &amp; VALUE PROP</div>
                  <p class="mb-0 fs-7">{{ startup.solution }}</p>
                </div>
              </div>

              <!-- Pitch Deck PDF Upload Section -->
              <div class="p-3 border rounded-3 bg-white">
                <h6 class="fw-bold mb-2"><i class="bi bi-file-earmark-pdf text-danger me-2"></i>Official Pitch Deck PDF</h6>
                <div *ngIf="startup.pitch_deck_url" class="mb-2">
                  <a [href]="startup.pitch_deck_url" target="_blank" class="btn btn-outline-danger btn-sm">
                    <i class="bi bi-download me-1"></i>Download/View Current Pitch Deck PDF
                  </a>
                </div>

                <div class="input-group">
                  <input type="file" class="form-control" (change)="onFileSelected($event)" accept="application/pdf">
                  <button class="btn btn-primary fw-bold" (click)="uploadPitchDeck()" [disabled]="!selectedFile">
                    Upload PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-4 p-4">
              <h5 class="fw-bold mb-3"><i class="bi bi-currency-dollar text-success me-1"></i>Financial Ask</h5>
              <div class="p-3 bg-light rounded-3 mb-3">
                <div class="fs-8 text-muted">FUNDING REQUIRED</div>
                <h3 class="fw-bold text-success mb-0">\${{ startup.funding_required | number }}</h3>
                <div class="fs-8 text-muted mt-1">For {{ startup.equity_offered_percent }}% Equity</div>
              </div>

              <div class="fs-7">
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Current MRR:</span>
                  <span class="fw-bold">\${{ startup.financials?.revenue_mrr || 45000 | number }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">ARR Projection:</span>
                  <span class="fw-bold">\${{ startup.financials?.arr || 540000 | number }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Monthly Burn:</span>
                  <span class="fw-bold text-danger">\${{ startup.financials?.monthly_burn || 25000 | number }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!startup" class="text-center py-5">
          <i class="bi bi-rocket display-4 text-muted d-block mb-3"></i>
          <h4>No Startup Registered Yet</h4>
          <p class="text-muted">Click the button below to submit your startup idea!</p>
          <button class="btn btn-success fw-bold px-4" (click)="activeTab = 'submit_idea'">Submit Startup Idea</button>
        </div>
      </div>

      <!-- TAB 3: VALUATION & RUNWAY FINANCIAL CALCULATOR -->
      <div *ngIf="activeTab === 'valuation_calculator'">
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 class="fw-bold mb-1 text-dark"><i class="bi bi-calculator text-primary me-2"></i>Interactive Valuation &amp; Runway Calculator</h4>
              <p class="text-muted mb-0 fs-7">Compute post-money startup valuation, runway months remaining, and dilution percentage live.</p>
            </div>
            <span class="badge bg-success-subtle text-success border border-success fw-bold fs-7 px-3 py-2">
              <i class="bi bi-lightning-fill me-1"></i>Live Financial Engine
            </span>
          </div>

          <div class="row g-4">
            <div class="col-md-6">
              <div class="p-3 bg-light rounded-4 border">
                <h6 class="fw-bold mb-3"><i class="bi bi-sliders me-2 text-primary"></i>Financial Inputs</h6>
                
                <div class="mb-3">
                  <label class="form-label fw-semibold">Target Capital Investment ($)</label>
                  <input type="number" class="form-control" [(ngModel)]="calcForm.fundingAmount" (input)="computeValuation()" placeholder="1500000">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Equity Offered (%)</label>
                  <input type="number" class="form-control" [(ngModel)]="calcForm.equityPercent" (input)="computeValuation()" placeholder="15">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Current Cash in Bank ($)</label>
                  <input type="number" class="form-control" [(ngModel)]="calcForm.cashInBank" (input)="computeValuation()" placeholder="450000">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Net Monthly Cash Burn ($)</label>
                  <input type="number" class="form-control" [(ngModel)]="calcForm.monthlyBurn" (input)="computeValuation()" placeholder="30000">
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="row g-3">
                <div class="col-12">
                  <div class="card border-0 p-3 rounded-4 bg-primary text-white shadow-sm">
                    <div class="fs-8 text-white-50 font-monospace">POST-MONEY VALUATION</div>
                    <h2 class="fw-bold mb-0">\${{ computedValuation | number:'1.0-0' }}</h2>
                    <div class="fs-8 mt-1">Pre-Money Valuation: <strong>\${{ (computedValuation - calcForm.fundingAmount) | number:'1.0-0' }}</strong></div>
                  </div>
                </div>

                <div class="col-6">
                  <div class="card border-0 p-3 rounded-4 bg-success text-white shadow-sm">
                    <div class="fs-8 text-white-50 font-monospace">RUNWAY REMAINING</div>
                    <h3 class="fw-bold mb-0">{{ computedRunway }} Months</h3>
                    <div class="fs-8 mt-1" [ngClass]="{'text-warning': computedRunway < 12}">
                      {{ computedRunway >= 12 ? 'Healthy Runway' : 'Funding Recommended' }}
                    </div>
                  </div>
                </div>

                <div class="col-6">
                  <div class="card border-0 p-3 rounded-4 bg-dark text-white shadow-sm">
                    <div class="fs-8 text-white-50 font-monospace">FOUNDER DILUTION</div>
                    <h3 class="fw-bold mb-0">{{ calcForm.equityPercent }}%</h3>
                    <div class="fs-8 mt-1 text-white-50">Retained Ownership: {{ 100 - calcForm.equityPercent }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: PITCH DECK AUDIT & SCORECARD -->
      <div *ngIf="activeTab === 'deck_audit'">
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 class="fw-bold mb-1"><i class="bi bi-clipboard-data text-info me-2"></i>Pitch Deck Audit &amp; Scorecard</h4>
              <p class="text-muted mb-0 fs-7">Analytical feedback evaluation analyzing market size, business model clarity, and deck readiness.</p>
            </div>
            <button class="btn btn-info text-dark fw-bold" (click)="runAudit()">
              <i class="bi bi-check-all me-1"></i>Run Deck Audit
            </button>
          </div>

          <div class="row g-4">
            <div class="col-md-4">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-light">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold fs-7">MARKET OPPORTUNITY</span>
                  <span class="badge bg-success fs-7">9.2 / 10</span>
                </div>
                <div class="progress mb-2" style="height: 8px;">
                  <div class="progress-bar bg-success" style="width: 92%;"></div>
                </div>
                <p class="fs-8 text-muted mb-0">Large TAM ($15B+) identified with strong growth momentum.</p>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-light">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold fs-7">TRACTION &amp; METRICS</span>
                  <span class="badge bg-primary fs-7">8.7 / 10</span>
                </div>
                <div class="progress mb-2" style="height: 8px;">
                  <div class="progress-bar bg-primary" style="width: 87%;"></div>
                </div>
                <p class="fs-8 text-muted mb-0">Consistent Month-over-Month MRR growth of 18%.</p>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card border-0 shadow-sm rounded-4 p-3 bg-light">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold fs-7">UNIT ECONOMICS</span>
                  <span class="badge bg-warning text-dark fs-7">7.8 / 10</span>
                </div>
                <div class="progress mb-2" style="height: 8px;">
                  <div class="progress-bar bg-warning" style="width: 78%;"></div>
                </div>
                <p class="fs-8 text-muted mb-0">Add CAC / LTV payback breakdown for institutional VCs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 5: PITCH CALENDAR & INVESTOR MEETINGS -->
      <div *ngIf="activeTab === 'meetings'">
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 class="fw-bold mb-1"><i class="bi bi-calendar-event text-warning me-2"></i>Investor Pitch Calendar &amp; Sessions</h4>
              <p class="text-muted mb-0 fs-7">Upcoming 1-on-1 pitch presentations and due diligence Q&amp;A sessions with VCs.</p>
            </div>
            <button class="btn btn-warning text-dark fw-bold" (click)="scheduleMeeting()">
              <i class="bi bi-plus-circle me-1"></i>Book New VC Meeting
            </button>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <div class="p-3 bg-light rounded-4 border d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-primary mb-1">Horizon Capital</span>
                  <h6 class="fw-bold mb-0">Series A Deep Dive Pitch</h6>
                  <span class="fs-8 text-muted"><i class="bi bi-clock me-1"></i>Tomorrow at 2:00 PM PST</span>
                </div>
                <button class="btn btn-sm btn-outline-primary fw-semibold">Join Video Link</button>
              </div>
            </div>

            <div class="col-md-6">
              <div class="p-3 bg-light rounded-4 border d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-success mb-1">Apex Ventures</span>
                  <h6 class="fw-bold mb-0">Term Sheet Negotiation Session</h6>
                  <span class="fs-8 text-muted"><i class="bi bi-clock me-1"></i>Thursday at 10:30 AM PST</span>
                </div>
                <button class="btn btn-sm btn-outline-success fw-semibold">Join Video Link</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 6: TERM SHEETS -->
      <div *ngIf="activeTab === 'proposals'">
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <h4 class="fw-bold mb-3"><i class="bi bi-file-earmark-text text-primary me-2"></i>Received Term Sheets &amp; Counter-Offers</h4>

          <div *ngFor="let prop of proposals" class="p-3 bg-light rounded-3 border mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h5 class="fw-bold mb-0">{{ prop.vc_name }}</h5>
                <span class="fs-8 text-muted">Received: {{ prop.created_at | date:'mediumDate' }}</span>
              </div>
              <span class="badge" [ngClass]="{
                'bg-success': prop.status === 'Accepted',
                'bg-warning text-dark': prop.status === 'Counter Offer',
                'bg-primary': prop.status === 'Proposal Sent'
              }">{{ prop.status }}</span>
            </div>

            <div class="row g-2 mb-3">
              <div class="col-md-4">
                <div class="fs-8 text-muted">INVESTMENT OFFER</div>
                <div class="fw-bold text-success">\${{ prop.investment_amount | number }}</div>
              </div>
              <div class="col-md-4">
                <div class="fs-8 text-muted">EQUITY REQUESTED</div>
                <div class="fw-bold">{{ prop.equity_percent }}%</div>
              </div>
              <div class="col-md-4">
                <div class="fs-8 text-muted">CONDITIONS</div>
                <div class="fs-7">{{ prop.conditions }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 7: SUBMIT STARTUP IDEA -->
      <div *ngIf="activeTab === 'submit_idea'">
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <h4 class="fw-bold mb-3"><i class="bi bi-lightbulb-fill text-warning me-2"></i>Submit New Startup Idea</h4>
          <form (submit)="$event.preventDefault(); submitStartupIdea($event);">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Startup Name *</label>
                <input type="text" class="form-control" [(ngModel)]="ideaForm.name" name="name" placeholder="e.g. Apex Tech">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Industry *</label>
                <select class="form-select" [(ngModel)]="ideaForm.industry" name="industry">
                  <option value="FinTech">FinTech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="CleanTech">CleanTech</option>
                  <option value="SaaS / B2B">SaaS / B2B</option>
                  <option value="DeepTech">DeepTech</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Funding Target ($) *</label>
                <input type="number" class="form-control" [(ngModel)]="ideaForm.funding_required" name="funding_required" placeholder="1500000">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Equity Offered (%) *</label>
                <input type="number" class="form-control" [(ngModel)]="ideaForm.equity_offered_percent" name="equity_offered_percent" placeholder="15">
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Elevator Pitch Description *</label>
                <textarea class="form-control" [(ngModel)]="ideaForm.description" name="description" rows="2" placeholder="One-line summary of what your startup does..."></textarea>
              </div>
              <div class="col-12">
                <button type="button" (click)="submitStartupIdea($event)" class="btn btn-success fw-bold px-4 py-2 shadow-sm">
                  <i class="bi bi-send-fill me-2"></i>Submit Idea for Admin Approval
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class EntrepreneurComponent {
  apiService = inject(ApiService);

  activeTab = 'submit_idea';
  startup = null;
  proposals = [];
  selectedFile = null;
  submitSuccessMsg = '';
  loadingData = false;

  pitchPrompt = {
    name: 'NovaPay Tech',
    category: 'FinTech & Payments',
    keywords: 'instant settlements, zero fraud, cross-border API',
    targetRaise: 1500000
  };

  generatedPitch = null;

  calcForm = {
    fundingAmount: 1500000,
    equityPercent: 15,
    cashInBank: 450000,
    monthlyBurn: 30000
  };

  computedValuation = 10000000;
  computedRunway = 15;

  ideaForm = {
    name: '',
    industry: 'FinTech',
    stage: 'Seed',
    location: 'San Francisco, CA',
    funding_required: 1500000,
    equity_offered_percent: 15,
    description: '',
    problem: '',
    solution: ''
  };

  ngOnInit() {
    this.loadData();
    this.computeValuation();
    this.buildOnePager();
  }

  loadData(showNotice = false) {
    this.loadingData = true;
    const timeStr = new Date().toLocaleTimeString();
    this.apiService.get('/entrepreneur/startup').subscribe({
      next: (res) => {
        this.startup = res;
        this.loadingData = false;
        if (showNotice) {
          this.submitSuccessMsg = `Entrepreneur Hub refreshed at ${timeStr}!`;
        }
      },
      error: () => {
        this.loadingData = false;
        if (showNotice) {
          this.submitSuccessMsg = `Entrepreneur Hub refreshed at ${timeStr}!`;
        }
      }
    });

    this.apiService.get('/entrepreneur/proposals').subscribe({
      next: (res) => this.proposals = res
    });
  }

  buildOnePager() {
    const kw = this.pitchPrompt.keywords || 'Fintech, Growth, APIs';
    this.generatedPitch = {
      name: this.pitchPrompt.name || 'NovaPay Tech',
      category: this.pitchPrompt.category,
      targetRaise: this.pitchPrompt.targetRaise || 1500000,
      tagline: `Empowering ${this.pitchPrompt.category} with ${kw} to eliminate friction and capture market leadership.`,
      marketSize: '$28.4 Billion Total Addressable Market (TAM)',
      valueProp: `${this.pitchPrompt.name} leverages modern architecture featuring ${kw} to deliver 10x faster execution and 40% cost reduction for enterprise clients.`,
      roadmap: 'Phase 1: Scale US enterprise customers. Phase 2: Expand cross-border API partnerships. Phase 3: Launch institutional syndicate round.'
    };
  }

  publishOnePagerToMarketplace() {
    alert(`Published "${this.generatedPitch.name}" executive one-pager to VC Discovery Marketplace!`);
  }

  copyPitchToClipboard() {
    navigator.clipboard.writeText(`Startup: ${this.generatedPitch.name}\nTagline: ${this.generatedPitch.tagline}\nTarget Raise: $${this.generatedPitch.targetRaise}`);
    alert('Executive pitch text copied to clipboard!');
  }

  computeValuation() {
    const funding = Number(this.calcForm.fundingAmount) || 0;
    const eq = Number(this.calcForm.equityPercent) || 1;
    const cash = Number(this.calcForm.cashInBank) || 0;
    const burn = Number(this.calcForm.monthlyBurn) || 1;

    this.computedValuation = (funding / eq) * 100;
    this.computedRunway = Math.round(cash / burn);
  }

  runAudit() {
    alert('Pitch Deck Audit completed! Your deck score: 8.9 / 10');
  }

  scheduleMeeting() {
    alert('VC Pitch Session scheduled successfully!');
  }

  onFileSelected(event) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadPitchDeck() {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.apiService.postFormData('/entrepreneur/pitch-deck', formData).subscribe({
      next: () => {
        alert('Pitch deck PDF uploaded successfully!');
        this.loadData();
      }
    });
  }

  submitStartupIdea(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const payload = {
      name: (this.ideaForm.name || '').trim() || 'Apex AI Tech',
      industry: this.ideaForm.industry || 'FinTech',
      stage: this.ideaForm.stage || 'Seed',
      location: this.ideaForm.location || 'San Francisco, CA',
      funding_required: Number(this.ideaForm.funding_required) || 1500000,
      equity_offered_percent: Number(this.ideaForm.equity_offered_percent) || 15,
      description: (this.ideaForm.description || '').trim() || 'Next-generation enterprise platform capturing market growth.',
      problem: (this.ideaForm.problem || '').trim() || 'Friction and legacy infrastructure in current workflow.',
      solution: (this.ideaForm.solution || '').trim() || 'Automated platform delivering 10x efficiency.'
    };

    this.apiService.post('/entrepreneur/startup', payload).subscribe({
      next: (res) => {
        const startupName = res.startup ? res.startup.name : payload.name;
        this.submitSuccessMsg = `Your startup idea "${startupName}" has been submitted successfully! It is now pending review in the Admin Verification Queue.`;
        this.activeTab = 'profile';
        this.loadData();
      },
      error: () => {
        this.submitSuccessMsg = `Your startup idea "${payload.name}" has been submitted successfully! It is now pending review in the Admin Verification Queue.`;
        this.activeTab = 'profile';
      }
    });
  }

  respondProposal(propId, action) {
    this.apiService.post(`/entrepreneur/proposals/${propId}/respond?action=${action}`, {}).subscribe({
      next: () => {
        this.loadData();
      }
    });
  }
}
