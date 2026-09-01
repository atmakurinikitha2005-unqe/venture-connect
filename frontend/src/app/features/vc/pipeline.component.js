import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-vc-pipeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid my-4">
      <h2 class="fw-bold mb-3"><i class="bi bi-kanban-fill text-warning me-2"></i>Investment Dealflow Kanban Pipeline</h2>
      <div class="row g-3 flex-nowrap overflow-auto pb-4">
        <div *ngFor="let stage of pipelineStages" class="col-md-3" style="min-width: 280px;">
          <div class="card border-0 shadow-sm rounded-4 bg-light p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold mb-0 text-dark">{{ stage }}</h6>
              <span class="badge bg-secondary">{{ (pipeline[stage] || []).length }}</span>
            </div>
            <div *ngFor="let item of pipeline[stage] || []" class="card border-0 shadow-sm rounded-3 p-3 mb-2 bg-white">
              <h6 class="fw-bold mb-1">{{ item.name }}</h6>
              <div class="fs-8 text-muted">{{ item.industry }} • \${{ item.funding_required | number }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VcPipelineComponent {
  apiService = inject(ApiService);
  pipeline = {};
  pipelineStages = ['New', 'Review', 'Shortlisted', 'Due Diligence', 'Meeting', 'Proposal', 'Negotiation', 'Invested'];

  ngOnInit() {
    this.apiService.get('/vc/pipeline').subscribe({
      next: (res) => this.pipeline = res
    });
  }
}
