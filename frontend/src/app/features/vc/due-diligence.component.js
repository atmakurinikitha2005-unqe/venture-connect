import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-vc-due-diligence',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid my-4">
      <h2 class="fw-bold mb-3"><i class="bi bi-check2-square text-info me-2"></i>Due Diligence Workspace</h2>
      <div *ngIf="workspace" class="card border-0 shadow-sm rounded-4 p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold mb-0">Audit Progress Meter</h4>
          <span class="fs-4 fw-bold text-primary">{{ workspace.completion_percentage }}%</span>
        </div>
        <div class="progress mb-4" style="height: 12px;">
          <div class="progress-bar bg-success" [style.width.%]="workspace.completion_percentage"></div>
        </div>

        <div *ngFor="let item of workspace.items" class="p-3 bg-light rounded-3 mb-2 d-flex justify-content-between align-items-center">
          <div>
            <span class="badge bg-secondary me-2">{{ item.category }}</span>
            <span class="fw-bold">{{ item.title }}</span>
            <div class="fs-8 text-muted">{{ item.description }}</div>
          </div>
          <span class="badge" [class.bg-success]="item.is_completed" [class.bg-warning]="!item.is_completed">
            {{ item.is_completed ? 'Completed' : 'Pending' }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class VcDueDiligenceComponent {
  apiService = inject(ApiService);
  workspace = null;

  ngOnInit() {
    this.apiService.get('/vc/due-diligence/stp_1').subscribe({
      next: (res) => this.workspace = res
    });
  }
}
