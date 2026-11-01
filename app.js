/**
 * Sales Analytics Dashboard - Core Application
 * Vanilla JavaScript (No Frameworks, No Backend, Persistent WebStorage)
 */

(function () {
  'use strict';

  // Constants
  const STORAGE_KEY = 'PULSESALES_DATA_STORAGE_V1';
  const MONTHLY_TARGET = 150000;

  // Application State
  const state = {
    transactions: [],
    filters: {
      timeframe: '30days',
      category: 'all',
      status: 'all',
      search: '',
      sort: 'date-desc'
    },
    pagination: {
      page: 1,
      pageSize: 10
    },
    chartInterval: 'day', // 'day' | 'month'
    charts: {
      timeline: null,
      category: null,
      channel: null,
      region: null
    }
  };

  // DOM Elements Cache
  const elements = {
    // Top Nav & Global Filters
    timeRangeSelect: document.getElementById('timeRangeSelect'),
    categoryFilterSelect: document.getElementById('categoryFilterSelect'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    btnResetData: document.getElementById('btnResetData'),
    btnOpenAddModal: document.getElementById('btnOpenAddModal'),
    dataRecordCountBadge: document.getElementById('dataRecordCountBadge'),

    // KPI Elements
    kpiTotalRevenue: document.getElementById('kpiTotalRevenue'),
    kpiRevenueGrowth: document.getElementById('kpiRevenueGrowth'),
    kpiNetProfit: document.getElementById('kpiNetProfit'),
    kpiProfitMargin: document.getElementById('kpiProfitMargin'),
    kpiProfitSubtitle: document.getElementById('kpiProfitSubtitle'),
    kpiTotalOrders: document.getElementById('kpiTotalOrders'),
    kpiCompletedOrders: document.getElementById('kpiCompletedOrders'),
    kpiAvgOrderValue: document.getElementById('kpiAvgOrderValue'),
    kpiUnitsPerOrder: document.getElementById('kpiUnitsPerOrder'),
    kpiSuccessRate: document.getElementById('kpiSuccessRate'),
    kpiRefundRate: document.getElementById('kpiRefundRate'),

    // Target Quota Elements
    targetPercentageText: document.getElementById('targetPercentageText'),
    targetProgressBar: document.getElementById('targetProgressBar'),
    targetAchievedAmount: document.getElementById('targetAchievedAmount'),
    targetGoalAmount: document.getElementById('targetGoalAmount'),
    miniPendingAmount: document.getElementById('miniPendingAmount'),
    miniRefundAmount: document.getElementById('miniRefundAmount'),
    miniTopChannel: document.getElementById('miniTopChannel'),

    // Chart Canvases & Controls
    revenueTimelineChart: document.getElementById('revenueTimelineChart'),
    categoryDonutChart: document.getElementById('categoryDonutChart'),
    channelBarChart: document.getElementById('channelBarChart'),
    regionBarChart: document.getElementById('regionBarChart'),
    chartIntervalBtns: document.querySelectorAll('[data-chart-group="time"]'),

    // Table & Controls
    tableSearchInput: document.getElementById('tableSearchInput'),
    tableStatusFilter: document.getElementById('tableStatusFilter'),
    tableSortSelect: document.getElementById('tableSortSelect'),
    transactionsTableBody: document.getElementById('transactionsTableBody'),
    tableEmptyState: document.getElementById('tableEmptyState'),
    paginationInfoText: document.getElementById('paginationInfoText'),
    pageSizeSelect: document.getElementById('pageSizeSelect'),
    btnPrevPage: document.getElementById('btnPrevPage'),
    btnNextPage: document.getElementById('btnNextPage'),
    pageCurrentDisplay: document.getElementById('pageCurrentDisplay'),

    // Modal Elements
    transactionModal: document.getElementById('transactionModal'),
    transactionForm: document.getElementById('transactionForm'),
    modalTitle: document.getElementById('modalTitle'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    formTransactionId: document.getElementById('formTransactionId'),
    formCustomerName: document.getElementById('formCustomerName'),
    formCustomerEmail: document.getElementById('formCustomerEmail'),
    formProductName: document.getElementById('formProductName'),
    formCategory: document.getElementById('formCategory'),
    formChannel: document.getElementById('formChannel'),
    formRegion: document.getElementById('formRegion'),
    formAmount: document.getElementById('formAmount'),
    formProfit: document.getElementById('formProfit'),
    formStatus: document.getElementById('formStatus'),
    formDate: document.getElementById('formDate'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Generates realistic initial seed dataset across categories and past months
   */
  function generateSeedData() {
    const categories = ['Electronics', 'Software', 'Fashion', 'Home', 'Services'];
    const channels = ['Online Store', 'Amazon', 'B2B Direct', 'Social Media', 'Retail Outlet'];
    const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East'];

    const customers = [
      { name: 'Marcus Sterling', email: 'm.sterling@acme-corp.com' },
      { name: 'Elena Rostova', email: 'elena.rostova@techvibe.io' },
      { name: 'David Chen', email: 'david.chen@bluewave.com' },
      { name: 'Sarah Jenkins', email: 's.jenkins@gmail.com' },
      { name: 'Alexander Wright', email: 'alex.wright@quantum-sys.com' },
      { name: 'Chloe Dubois', email: 'chloe.dubois@luxstyle.fr' },
      { name: 'Carlos Morales', email: 'cmorales@soluciones.es' },
      { name: 'Hannah Schmidt', email: 'h.schmidt@berlintech.de' },
      { name: 'Liam O\'Connor', email: 'liam@celticsolutions.ie' },
      { name: 'Aaliyah Khan', email: 'aaliyah.k@novasphere.org' },
      { name: 'Oliver Twist', email: 'oliver.t@londonhub.co.uk' },
      { name: 'Kenji Sato', email: 'kenji.sato@kyotocorp.jp' },
      { name: 'Beatriz Silva', email: 'bsilva@riotech.br' },
      { name: 'Vikram Malhotra', email: 'vikram.m@mumbaiventures.in' },
      { name: 'Grace Hopper', email: 'grace.h@compufuture.net' }
    ];

    const catalog = {
      'Electronics': [
        { product: 'UltraHD 4K Curved Monitor 34"', priceRange: [550, 780], margin: 0.32 },
        { product: 'Pro Noise-Cancelling Headphones', priceRange: [240, 350], margin: 0.42 },
        { product: 'Thunderbolt 4 Multi-Dock Station', priceRange: [180, 260], margin: 0.45 },
        { product: 'Wireless Mechanical Keyboard RGB', priceRange: [110, 190], margin: 0.38 },
        { product: 'Precision Ergonomic Gaming Mouse', priceRange: [75, 120], margin: 0.50 }
      ],
      'Software': [
        { product: 'Enterprise Cloud Suite (Annual)', priceRange: [2400, 4800], margin: 0.82 },
        { product: 'Cybersecurity Threat Shield Pro', priceRange: [1200, 2100], margin: 0.78 },
        { product: 'AI Workflow Automation Seat', priceRange: [450, 850], margin: 0.85 },
        { product: 'Developer API Premium Plan', priceRange: [300, 600], margin: 0.80 },
        { product: 'Data Pipeline Analytics License', priceRange: [1500, 3200], margin: 0.75 }
      ],
      'Fashion': [
        { product: 'Italian Full-Grain Leather Briefcase', priceRange: [320, 580], margin: 0.48 },
        { product: 'Merino Wool Executive Overcoat', priceRange: [420, 750], margin: 0.52 },
        { product: 'Smart Fitness Chronograph Watch', priceRange: [260, 450], margin: 0.39 },
        { product: 'Handcrafted Oxford Dress Shoes', priceRange: [210, 340], margin: 0.45 },
        { product: 'Traveler Waterproof Duffel Bag', priceRange: [130, 220], margin: 0.44 }
      ],
      'Home': [
        { product: 'Smart Dual-Motor Standing Desk', priceRange: [650, 980], margin: 0.35 },
        { product: 'Ergonomic Mesh Executive Chair', priceRange: [480, 720], margin: 0.40 },
        { product: 'HEPA 14 Air Purification System', priceRange: [220, 380], margin: 0.42 },
        { product: 'Dimmable Ambient Monitor Light Bar', priceRange: [65, 110], margin: 0.55 },
        { product: 'Acoustic Sound Absorption Panels (6x)', priceRange: [140, 220], margin: 0.50 }
      ],
      'Services': [
        { product: 'Cloud Architecture Security Audit', priceRange: [2800, 5500], margin: 0.70 },
        { product: 'Dedicated Sales Pipeline Optimization', priceRange: [1800, 3400], margin: 0.65 },
        { product: 'Enterprise Onboarding & Training', priceRange: [1200, 2500], margin: 0.68 },
        { product: 'Custom Web & Mobile Integration', priceRange: [3500, 6000], margin: 0.62 },
        { product: 'Quarterly Executive Advisory Retainer', priceRange: [4000, 7500], margin: 0.75 }
      ]
    };

    const statuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Pending', 'Refunded'];
    const now = new Date('2026-11-01T20:00:00');
    const records = [];
    let orderNum = 8800;

    // Generate ~52 transactions spanning the past 120 days
    for (let i = 0; i < 52; i++) {
      orderNum++;
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const items = catalog[cat];
      const item = items[Math.floor(Math.random() * items.length)];
      const cust = customers[Math.floor(Math.random() * customers.length)];
      const chan = channels[Math.floor(Math.random() * channels.length)];
      const reg = regions[Math.floor(Math.random() * regions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Random date within past 110 days
      const daysAgo = Math.floor(Math.random() * 110);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minsAgo = Math.floor(Math.random() * 60);
      const date = new Date(now.getTime() - (daysAgo * 86400000 + hoursAgo * 3600000 + minsAgo * 60000));

      const minP = item.priceRange[0];
      const maxP = item.priceRange[1];
      const amount = Math.round((Math.random() * (maxP - minP) + minP) * 100) / 100;
      const profit = Math.round((amount * item.margin) * 100) / 100;

      records.push({
        id: `ORD-${orderNum}`,
        customer: cust.name,
        email: cust.email,
        product: item.product,
        category: cat,
        channel: chan,
        region: reg,
        amount: amount,
        profit: profit,
        status: status,
        date: date.toISOString()
      });
    }

    // Sort descending by date initially
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    return records;
  }

  /**
   * LocalStorage Helpers
   */
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
    const seed = generateSeedData();
    saveData(seed);
    return seed;
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
      showToast('Local storage limit exceeded or blocked.', 'danger');
    }
  }

  /**
   * Formatting Utilities
   */
  function formatCurrency(val) {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  function formatShortNumber(val) {
    const num = Number(val) || 0;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toLocaleString();
  }

  function formatDateTime(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function toInputDateTime(isoString) {
    const d = isoString ? new Date(isoString) : new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  /**
   * Filtering Engine
   */
  function getFilteredTransactions() {
    const now = new Date('2026-11-01T20:40:00'); // Baseline aligned with environment
    const timeframe = state.filters.timeframe;
    const category = state.filters.category;

    return state.transactions.filter(item => {
      // 1. Timeframe filter
      if (timeframe !== 'all') {
        const itemDate = new Date(item.date);
        const diffMs = now.getTime() - itemDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (timeframe === 'today') {
          if (diffDays > 1 || itemDate.getDate() !== now.getDate() || itemDate.getMonth() !== now.getMonth()) {
            return false;
          }
        } else if (timeframe === '7days') {
          if (diffDays > 7 || diffDays < 0) return false;
        } else if (timeframe === '30days') {
          if (diffDays > 30 || diffDays < 0) return false;
        } else if (timeframe === '90days') {
          if (diffDays > 90 || diffDays < 0) return false;
        } else if (timeframe === 'year') {
          if (itemDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      // 2. Category filter
      if (category !== 'all' && item.category !== category) {
        return false;
      }

      return true;
    });
  }

  /**
   * Table specific filtering, sorting, and pagination
   */
  function getTableTransactions(baseTransactions) {
    let result = [...baseTransactions];

    // Status filter
    if (state.filters.status !== 'all') {
      result = result.filter(item => item.status === state.filters.status);
    }

    // Search query
    const q = state.filters.search.trim().toLowerCase();
    if (q) {
      result = result.filter(item => {
        return (
          item.id.toLowerCase().includes(q) ||
          item.customer.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.product.toLowerCase().includes(q) ||
          item.channel.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      const sort = state.filters.sort;
      if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sort === 'amount-desc') return b.amount - a.amount;
      if (sort === 'amount-asc') return a.amount - b.amount;
      if (sort === 'profit-desc') return b.profit - a.profit;
      return 0;
    });

    return result;
  }

  /**
   * Recalculate KPIs and Metrics
   */
  function updateKPIs(filtered) {
    const totalTransactions = filtered.length;
    const completed = filtered.filter(t => t.status === 'Completed');
    const refunded = filtered.filter(t => t.status === 'Refunded');
    const pending = filtered.filter(t => t.status === 'Pending');

    // Revenue = sum of completed transactions
    const totalGrossRevenue = completed.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalNetProfit = completed.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
    const totalOrdersCount = completed.length;
    const avgOrderValue = totalOrdersCount > 0 ? (totalGrossRevenue / totalOrdersCount) : 0;
    const profitMargin = totalGrossRevenue > 0 ? ((totalNetProfit / totalGrossRevenue) * 100).toFixed(1) : 0;
    const fulfillmentRate = totalTransactions > 0 ? ((completed.length / totalTransactions) * 100).toFixed(1) : 0;

    // Pending & Refund Totals
    const pendingSum = pending.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const refundSum = refunded.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // Find top channel
    const channelCounts = {};
    completed.forEach(t => {
      channelCounts[t.channel] = (channelCounts[t.channel] || 0) + t.amount;
    });
    let topChannel = 'N/A';
    let topChannelRevenue = 0;
    for (const [chan, rev] of Object.entries(channelCounts)) {
      if (rev > topChannelRevenue) {
        topChannelRevenue = rev;
        topChannel = chan;
      }
    }

    // Populate DOM
    elements.kpiTotalRevenue.textContent = formatCurrency(totalGrossRevenue);
    elements.kpiNetProfit.textContent = formatCurrency(totalNetProfit);
    elements.kpiProfitMargin.textContent = `Margin: ${profitMargin}%`;
    elements.kpiTotalOrders.textContent = totalOrdersCount.toLocaleString();
    elements.kpiCompletedOrders.textContent = `${completed.length} Completed`;
    elements.kpiAvgOrderValue.textContent = formatCurrency(avgOrderValue);
    elements.kpiSuccessRate.textContent = `${fulfillmentRate}%`;
    elements.kpiRefundRate.textContent = `${refunded.length} Refunded`;

    elements.dataRecordCountBadge.textContent = `${filtered.length} transactions in timeframe`;

    // Target Quota Progress
    const progressPercent = Math.min(100, Math.round((totalGrossRevenue / MONTHLY_TARGET) * 100));
    elements.targetPercentageText.textContent = `${progressPercent}%`;
    elements.targetProgressBar.style.width = `${progressPercent}%`;
    elements.targetAchievedAmount.textContent = `${formatCurrency(totalGrossRevenue)} achieved`;
    elements.targetGoalAmount.textContent = `Goal: ${formatCurrency(MONTHLY_TARGET)}`;
    elements.miniPendingAmount.textContent = formatCurrency(pendingSum);
    elements.miniRefundAmount.textContent = formatCurrency(refundSum);
    elements.miniTopChannel.textContent = topChannel;
  }

  /**
   * Render or Update Charts via Chart.js
   */
  function updateCharts(filtered) {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js library not detected');
      return;
    }

    // Chart global defaults for dark theme
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.borderColor = '#1f2937';
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    updateTimelineChart(filtered);
    updateCategoryChart(filtered);
    updateChannelChart(filtered);
    updateRegionChart(filtered);
  }

  /**
   * Chart 1: Revenue & Profit Timeline
   */
  function updateTimelineChart(filtered) {
    const isMonthly = state.chartInterval === 'month';
    const grouped = {};

    // Group only completed transactions
    const sorted = [...filtered]
      .filter(t => t.status === 'Completed')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(t => {
      const d = new Date(t.date);
      let key;
      if (isMonthly) {
        key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else {
        key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (!grouped[key]) {
        grouped[key] = { revenue: 0, profit: 0 };
      }
      grouped[key].revenue += t.amount;
      grouped[key].profit += t.profit;
    });

    const labels = Object.keys(grouped);
    const revenueData = labels.map(k => Math.round(grouped[k].revenue));
    const profitData = labels.map(k => Math.round(grouped[k].profit));

    if (state.charts.timeline) {
      state.charts.timeline.destroy();
    }

    const ctx = elements.revenueTimelineChart.getContext('2d');

    // Create subtle gradient for revenue fill
    const blueGradient = ctx.createLinearGradient(0, 0, 0, 260);
    blueGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    blueGradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    state.charts.timeline = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [
          {
            label: 'Gross Revenue ($)',
            data: revenueData.length ? revenueData : [0],
            borderColor: '#3b82f6',
            backgroundColor: blueGradient,
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#111827',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Net Profit ($)',
            data: profitData.length ? profitData : [0],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            fill: false,
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#111827',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { size: 12, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#f9fafb',
            bodyColor: '#e5e7eb',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (ctx) {
                return `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#1f2937' },
            ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 12 }
          },
          y: {
            grid: { color: '#1f2937' },
            ticks: {
              callback: function (val) {
                return '$' + formatShortNumber(val);
              }
            }
          }
        }
      }
    });
  }

  /**
   * Chart 2: Category Distribution Donut Chart
   */
  function updateCategoryChart(filtered) {
    const categoryTotals = {};
    filtered.filter(t => t.status === 'Completed').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = labels.map(k => Math.round(categoryTotals[k]));
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];

    if (state.charts.category) {
      state.charts.category.destroy();
    }

    const ctx = elements.categoryDonutChart.getContext('2d');
    state.charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: colors.slice(0, Math.max(1, labels.length)),
          borderColor: '#111827',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 12,
              font: { size: 11 }
            }
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#f9fafb',
            bodyColor: '#e5e7eb',
            borderColor: '#374151',
            borderWidth: 1,
            callbacks: {
              label: function (ctx) {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const percent = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                return ` ${ctx.label}: ${formatCurrency(ctx.raw)} (${percent}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  /**
   * Chart 3: Channel Bar Chart
   */
  function updateChannelChart(filtered) {
    const channelTotals = {};
    filtered.filter(t => t.status === 'Completed').forEach(t => {
      channelTotals[t.channel] = (channelTotals[t.channel] || 0) + t.amount;
    });

    const labels = Object.keys(channelTotals);
    const data = labels.map(k => Math.round(channelTotals[k]));

    if (state.charts.channel) {
      state.charts.channel.destroy();
    }

    const ctx = elements.channelBarChart.getContext('2d');
    state.charts.channel = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          label: 'Revenue by Channel',
          data: data.length ? data : [0],
          backgroundColor: '#3b82f6',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1f2937',
            borderColor: '#374151',
            borderWidth: 1,
            callbacks: {
              label: function (ctx) {
                return ` Revenue: ${formatCurrency(ctx.raw)}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#1f2937' },
            ticks: {
              callback: function (val) {
                return '$' + formatShortNumber(val);
              }
            }
          }
        }
      }
    });
  }

  /**
   * Chart 4: Region Bar Chart
   */
  function updateRegionChart(filtered) {
    const regionTotals = {};
    filtered.filter(t => t.status === 'Completed').forEach(t => {
      regionTotals[t.region] = (regionTotals[t.region] || 0) + t.amount;
    });

    const labels = Object.keys(regionTotals);
    const data = labels.map(k => Math.round(regionTotals[k]));

    if (state.charts.region) {
      state.charts.region.destroy();
    }

    const ctx = elements.regionBarChart.getContext('2d');
    state.charts.region = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          label: 'Regional Sales',
          data: data.length ? data : [0],
          backgroundColor: '#8b5cf6',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1f2937',
            borderColor: '#374151',
            borderWidth: 1,
            callbacks: {
              label: function (ctx) {
                return ` Regional Volume: ${formatCurrency(ctx.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#1f2937' },
            ticks: {
              callback: function (val) {
                return '$' + formatShortNumber(val);
              }
            }
          },
          y: { grid: { display: false } }
        }
      }
    });
  }

  /**
   * Render Table Rows with Search, Sorting & Pagination
   */
  function updateTable() {
    const baseFiltered = getFilteredTransactions();
    const tableFiltered = getTableTransactions(baseFiltered);
    const totalItems = tableFiltered.length;
    const pageSize = state.pagination.pageSize;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Clamp current page
    if (state.pagination.page > totalPages) {
      state.pagination.page = totalPages;
    }
    if (state.pagination.page < 1) {
      state.pagination.page = 1;
    }

    const currentPage = state.pagination.page;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const pageItems = tableFiltered.slice(startIndex, endIndex);

    // Empty state handling
    if (totalItems === 0) {
      elements.transactionsTableBody.innerHTML = '';
      elements.tableEmptyState.classList.remove('hidden');
    } else {
      elements.tableEmptyState.classList.add('hidden');
      renderTableRows(pageItems);
    }

    // Pagination display
    elements.paginationInfoText.textContent = totalItems === 0
      ? 'Showing 0 of 0 entries'
      : `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`;

    elements.pageCurrentDisplay.textContent = `${currentPage} / ${totalPages}`;
    elements.btnPrevPage.disabled = currentPage <= 1;
    elements.btnNextPage.disabled = currentPage >= totalPages;
  }

  function renderTableRows(items) {
    const html = items.map(t => {
      let statusClass = 'status-completed';
      if (t.status === 'Pending') statusClass = 'status-pending';
      if (t.status === 'Refunded') statusClass = 'status-refunded';

      return `
        <tr data-id="${escapeHtml(t.id)}">
          <td><span class="order-badge-id">${escapeHtml(t.id)}</span></td>
          <td>${formatDateTime(t.date)}</td>
          <td>
            <div class="customer-cell">
              <span class="customer-name">${escapeHtml(t.customer)}</span>
              <span class="customer-email">${escapeHtml(t.email)}</span>
            </div>
          </td>
          <td><strong>${escapeHtml(t.product)}</strong></td>
          <td><span class="category-tag">${escapeHtml(t.category)}</span></td>
          <td>${escapeHtml(t.channel)}</td>
          <td>${escapeHtml(t.region || 'North America')}</td>
          <td class="text-right"><strong>${formatCurrency(t.amount)}</strong></td>
          <td class="text-right text-success">${formatCurrency(t.profit)}</td>
          <td class="text-center">
            <span class="status-pill ${statusClass}">${escapeHtml(t.status)}</span>
          </td>
          <td class="text-center">
            <button class="btn btn-sm-action btn-edit" data-action="edit" data-id="${escapeHtml(t.id)}" title="Edit transaction">Edit</button>
            <button class="btn btn-sm-action btn-delete" data-action="delete" data-id="${escapeHtml(t.id)}" title="Delete transaction">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    elements.transactionsTableBody.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Master Refresh: Recomputes dashboard entirely
   */
  function refreshDashboard() {
    const filtered = getFilteredTransactions();
    updateKPIs(filtered);
    updateCharts(filtered);
    updateTable();
  }

  /**
   * Modal Dialog Handling
   */
  function openAddModal() {
    elements.modalTitle.textContent = 'New Sales Transaction';
    elements.formTransactionId.value = '';
    elements.transactionForm.reset();
    elements.formDate.value = toInputDateTime();
    elements.formStatus.value = 'Completed';
    elements.formCategory.value = 'Electronics';
    elements.formChannel.value = 'Online Store';
    elements.formRegion.value = 'North America';
    elements.transactionModal.classList.remove('hidden');
    elements.formCustomerName.focus();
  }

  function openEditModal(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    elements.modalTitle.textContent = `Edit Transaction: ${tx.id}`;
    elements.formTransactionId.value = tx.id;
    elements.formCustomerName.value = tx.customer;
    elements.formCustomerEmail.value = tx.email;
    elements.formProductName.value = tx.product;
    elements.formCategory.value = tx.category;
    elements.formChannel.value = tx.channel;
    elements.formRegion.value = tx.region || 'North America';
    elements.formAmount.value = tx.amount;
    elements.formProfit.value = tx.profit;
    elements.formStatus.value = tx.status;
    elements.formDate.value = toInputDateTime(tx.date);

    elements.transactionModal.classList.remove('hidden');
    elements.formCustomerName.focus();
  }

  function closeModal() {
    elements.transactionModal.classList.add('hidden');
    elements.transactionForm.reset();
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const id = elements.formTransactionId.value.trim();
    const customer = elements.formCustomerName.value.trim();
    const email = elements.formCustomerEmail.value.trim();
    const product = elements.formProductName.value.trim();
    const category = elements.formCategory.value;
    const channel = elements.formChannel.value;
    const region = elements.formRegion.value;
    const amount = parseFloat(elements.formAmount.value);
    const profit = parseFloat(elements.formProfit.value);
    const status = elements.formStatus.value;
    const dateInput = elements.formDate.value;
    const dateIso = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();

    if (isNaN(amount) || amount <= 0) {
      showToast('Please provide a valid sale amount.', 'danger');
      return;
    }

    if (id) {
      // Edit existing
      const index = state.transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        state.transactions[index] = {
          ...state.transactions[index],
          customer,
          email,
          product,
          category,
          channel,
          region,
          amount,
          profit: isNaN(profit) ? Math.round(amount * 0.4 * 100) / 100 : profit,
          status,
          date: dateIso
        };
        saveData(state.transactions);
        refreshDashboard();
        closeModal();
        showToast(`Transaction ${id} updated successfully.`, 'success');
      }
    } else {
      // Create new
      const nextId = 'ORD-' + (Math.floor(Math.random() * 9000) + 1000);
      const newTx = {
        id: nextId,
        customer,
        email,
        product,
        category,
        channel,
        region,
        amount,
        profit: isNaN(profit) ? Math.round(amount * 0.4 * 100) / 100 : profit,
        status,
        date: dateIso
      };

      state.transactions.unshift(newTx);
      saveData(state.transactions);
      refreshDashboard();
      closeModal();
      showToast(`Transaction ${nextId} created successfully.`, 'success');
    }
  }

  function handleDelete(id) {
    if (!confirm(`Are you sure you want to delete order ${id}? This action cannot be undone.`)) {
      return;
    }
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveData(state.transactions);
    refreshDashboard();
    showToast(`Transaction ${id} deleted.`, 'warning');
  }

  /**
   * Export to CSV
   */
  function exportCSV() {
    const filtered = getFilteredTransactions();
    if (!filtered.length) {
      showToast('No records available to export for this selection.', 'warning');
      return;
    }

    const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Product', 'Category', 'Channel', 'Region', 'Amount', 'Profit', 'Status'];
    const rows = filtered.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.customer.replace(/"/g, '""')}"`,
      `"${t.email.replace(/"/g, '""')}"`,
      `"${t.product.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.channel}"`,
      `"${t.region || ''}"`,
      t.amount,
      t.profit,
      `"${t.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const nowStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `pulsesales-analytics-${nowStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filtered.length} transactions to CSV.`, 'success');
  }

  /**
   * Reset Data to Default Demo
   */
  function resetDemoData() {
    if (!confirm('Reset dashboard to fresh realistic demo records? Any custom added sales will be replaced.')) {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    state.transactions = generateSeedData();
    saveData(state.transactions);
    state.pagination.page = 1;
    refreshDashboard();
    showToast('Dashboard reset to rich sample records.', 'success');
  }

  /**
   * Toast Notifications Helper
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }

  /**
   * Event Listeners Registration
   */
  function registerEvents() {
    // Top Bar Filters
    elements.timeRangeSelect.addEventListener('change', (e) => {
      state.filters.timeframe = e.target.value;
      state.pagination.page = 1;
      refreshDashboard();
    });

    elements.categoryFilterSelect.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      state.pagination.page = 1;
      refreshDashboard();
    });

    // Top Bar Action Buttons
    elements.btnExportCsv.addEventListener('click', exportCSV);
    elements.btnResetData.addEventListener('click', resetDemoData);
    elements.btnOpenAddModal.addEventListener('click', openAddModal);

    // Chart Interval Buttons (Daily / Monthly)
    elements.chartIntervalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        elements.chartIntervalBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.chartInterval = e.target.dataset.interval;
        updateTimelineChart(getFilteredTransactions());
      });
    });

    // Auto-compute profit estimation on amount input in modal
    elements.formAmount.addEventListener('input', (e) => {
      const amt = parseFloat(e.target.value);
      if (!isNaN(amt) && amt > 0 && !elements.formProfit.value) {
        elements.formProfit.value = (amt * 0.45).toFixed(2);
      }
    });

    // Table Controls
    let searchDebounceTimer = null;
    elements.tableSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        state.filters.search = e.target.value;
        state.pagination.page = 1;
        updateTable();
      }, 200);
    });

    elements.tableStatusFilter.addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      state.pagination.page = 1;
      updateTable();
    });

    elements.tableSortSelect.addEventListener('change', (e) => {
      state.filters.sort = e.target.value;
      updateTable();
    });

    elements.pageSizeSelect.addEventListener('change', (e) => {
      state.pagination.pageSize = parseInt(e.target.value, 10);
      state.pagination.page = 1;
      updateTable();
    });

    elements.btnPrevPage.addEventListener('click', () => {
      if (state.pagination.page > 1) {
        state.pagination.page--;
        updateTable();
      }
    });

    elements.btnNextPage.addEventListener('click', () => {
      state.pagination.page++;
      updateTable();
    });

    // Table Actions (Edit & Delete delegation)
    elements.transactionsTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'edit') {
        openEditModal(id);
      } else if (action === 'delete') {
        handleDelete(id);
      }
    });

    // Modal Events
    elements.btnCloseModal.addEventListener('click', closeModal);
    elements.btnCancelModal.addEventListener('click', closeModal);
    elements.transactionModal.addEventListener('click', (e) => {
      if (e.target === elements.transactionModal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !elements.transactionModal.classList.contains('hidden')) {
        closeModal();
      }
    });
    elements.transactionForm.addEventListener('submit', handleFormSubmit);

    // Multi-tab sync via storage event
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          state.transactions = JSON.parse(e.newValue);
          refreshDashboard();
          showToast('Dashboard data synchronized from another window.', 'info');
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  /**
   * Application Initialization
   */
  function init() {
    state.transactions = loadData();
    registerEvents();
    refreshDashboard();
  }

  // Bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
