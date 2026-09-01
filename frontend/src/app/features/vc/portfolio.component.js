import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-vc-portfolio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid my-4">
      <h2 class="fw-bold mb-3"><i class="bi bi-briefcase text-success me-2"></i>Active Portfolio Companies</h2>
      <div class="row g-4">
        <div *ngFor="let item of items" class="col-md-6">
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <h5 class="fw-bold mb-1">{{ item.startup_name }}</h5>
            <div class="fs-7 text-success fw-bold mb-2">\${{ item.investment_amount | number }} ({{ item.equity_percent }}% Equity)</div>
            <div class="fs-8 text-muted">Invested Date: {{ item.investment_date }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VcPortfolioComponent {
  apiService = inject(ApiService);
  items = [];

  ngOnInit() {
    this.apiService.get('/vc/portfolio').subscribe({
      next: (res) => this.items = res
    });
  }
}
