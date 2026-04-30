class ChartManager {
  static charts = {};

  static createPieChart(containerId, data, labels) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return null;

    this.destroyChart(containerId);

    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    this.charts[containerId] = chart;
    return chart;
  }

  static createBarChart(containerId, labels, datasets) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return null;

    this.destroyChart(containerId);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    this.charts[containerId] = chart;
    return chart;
  }

  static createLineChart(containerId, labels, datasets) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return null;

    this.destroyChart(containerId);

    const chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    this.charts[containerId] = chart;
    return chart;
  }

  static createRadarChart(containerId, labels, data) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return null;

    this.destroyChart(containerId);

    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: '实际摄入',
          data: data.actual,
          borderColor: '#42a5f5',
          backgroundColor: 'rgba(66, 165, 245, 0.2)'
        }, {
          label: '推荐摄入',
          data: data.recommended,
          borderColor: '#66bb6a',
          backgroundColor: 'rgba(102, 187, 106, 0.2)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    this.charts[containerId] = chart;
    return chart;
  }

  static destroyChart(chartId) {
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
      delete this.charts[chartId];
    }
  }

  static updateChart(chartId, newData) {
    const chart = this.charts[chartId];
    if (!chart) return false;

    chart.data = newData;
    chart.update();
    return true;
  }

  static destroyAll() {
    Object.keys(this.charts).forEach(id => this.destroyChart(id));
  }
}
