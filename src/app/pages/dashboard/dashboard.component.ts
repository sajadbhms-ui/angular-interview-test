import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  DashboardData,
  DashboardService
} from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  isLoading = true;
  errorMessage = '';

  private readonly donutColors = ['#b8b8b8', '#cecece', '#999999', '#aaa'];

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load dashboard data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  get donutGradient(): string {
    const items = this.dashboardData?.chartDonut ?? [];
    const total = items.reduce((sum, item) => sum + item.value, 0);

    if (!total) {
      return 'conic-gradient(#ccc 0% 100%)';
    }

    let offset = 0;
    const stops = items.map((item, index) => {
      const start = offset;
      offset += (item.value / total) * 100;
      return `${this.donutColors[index % this.donutColors.length]} ${start}% ${offset}%`;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }

  getBarHeight(value: number): number {
    const items = this.dashboardData?.chartBar ?? [];
    const max = Math.max(...items.map((item) => item.value), 0);

    return max ? (value / max) * 100 : 0;
  }

  signOut(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/']);
  }
}