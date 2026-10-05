import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import {
  DashboardData,
  DashboardService
} from '../../services/dashboard.service';

type ChartDatum = {
  name: string;
  value: number;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewChecked {
  @ViewChild('donutChart')
  private donutChart?: ElementRef<HTMLDivElement>;

  @ViewChild('barChart')
  private barChart?: ElementRef<HTMLDivElement>;

  dashboardData: DashboardData | null = null;
  isLoading = true;
  errorMessage = '';

  private renderedData: DashboardData | null = null;
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

  ngAfterViewChecked(): void {
    const data = this.dashboardData;

    if (
      !data ||
      data === this.renderedData ||
      !this.donutChart ||
      !this.barChart
    ) {
      return;
    }

    this.renderDonutChart(data.chartDonut);
    this.renderBarChart(data.chartBar);
    this.renderedData = data;
  }

  private renderDonutChart(items: ChartDatum[]): void {
    const host = this.donutChart?.nativeElement;
    if (!host) return;

    d3.select(host).selectAll('*').remove();

    const width = 320;
    const height = 240;
    const radius = 94;

    const svg = d3.select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('role', 'img')
      .attr('aria-label', 'Donut chart');

    const color = d3.scaleOrdinal<string>()
      .range(this.donutColors);

    const arcs = d3.pie<ChartDatum>()
      .sort(null)
      .value((item) => item.value)(items.filter((item) => item.value > 0));

    const arc = d3.arc<d3.PieArcDatum<ChartDatum>>()
      .innerRadius(radius * 0.42)
      .outerRadius(radius);

    svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('d', (item) => arc(item) ?? '')
      .attr('fill', (item) => color(item.data.name))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .append('title')
      .text((item) => `${item.data.name}: ${item.data.value}`);
  }

  private renderBarChart(items: ChartDatum[]): void {
    const host = this.barChart?.nativeElement;
    if (!host) return;

    d3.select(host).selectAll('*').remove();

    const width = 460;
    const height = 220;
    const margin = { top: 12, right: 8, bottom: 4, left: 12 };
    const maxValue = d3.max(items, (item) => item.value) ?? 0;

    const svg = d3.select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('role', 'img')
      .attr('aria-label', 'Bar chart');

    const x = d3.scaleBand<string>()
      .domain(items.map((item) => item.name))
      .range([margin.left, width - margin.right])
      .padding(0.25);

    const y = d3.scaleLinear()
      .domain([0, maxValue > 0 ? maxValue : 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', height - margin.bottom)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#ddd')
      .attr('stroke-width', 2);

    svg.append('line')
      .attr('x1', margin.left)
      .attr('x2', margin.left)
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#ddd')
      .attr('stroke-width', 2);

    svg.selectAll('rect')
      .data(items)
      .join('rect')
      .attr('x', (item) => x(item.name) ?? 0)
      .attr('y', (item) => y(item.value))
      .attr('width', x.bandwidth())
      .attr('height', (item) => height - margin.bottom - y(item.value))
      .attr('fill', '#a3a3a3')
      .append('title')
      .text((item) => `${item.name}: ${item.value}`);
  }

  signOut(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/']);
  }
}