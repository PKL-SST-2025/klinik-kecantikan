import { createSignal, onMount, createMemo, onCleanup, createEffect } from 'solid-js';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import {
  Pasien,
  Appointment,
  Invoice,
  Treatment,
  Produk,
  Dokter
} from '../types/database';
import {
  produkList,
  treatmentList,
  invoiceList,
  appointmentList,
  pasienList,
  dokterList,
} from '../stores/localDataStore'; // Perbaiki path jika berbeda

const Statistik = () => {
  const [selectedPeriod, setSelectedPeriod] = createSignal('7');
  let productChartRef: HTMLDivElement | undefined;
  let revenueChartRef: HTMLDivElement | undefined;
  let paymentChartRef: HTMLDivElement | undefined;

  // AmCharts root instances
  let productRoot: am5.Root | null = null;
  let paymentRoot: am5.Root | null = null;
  let revenueRoot: am5.Root | null = null;

  // Statistik dasar
  const basicStats = createMemo(() => {
    const today = new Date();
    const periodDays = parseInt(selectedPeriod());
    const periodStart = new Date(today.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    const recentInvoices = invoiceList().filter(invoice => {
      const invoiceDate = new Date(invoice.tanggal);
      return invoiceDate >= periodStart && invoiceDate <= today;
    });

    const recentAppointments = appointmentList().filter(appointment => {
      const appointmentDate = new Date(appointment.tanggal);
      return appointmentDate >= periodStart && appointmentDate <= today;
    });

    const totalRevenue = recentInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalAppointments = recentAppointments.length;
    const totalPatients = pasienList().length; // Total unique patients regardless of period filter
    const averageRevenuePerTransaction = recentInvoices.length > 0 ? totalRevenue / recentInvoices.length : 0;

    return {
      totalRevenue,
      totalAppointments,
      totalPatients,
      averageRevenuePerTransaction
    };
  });

  // Data untuk charts
  const productSalesData = createMemo(() => {
    const productCount: { [key: number]: number } = {};

    invoiceList().forEach(invoice => {
      invoice.items.forEach(item => {
        if (item.type === 'product') {
          productCount[item.itemId] = (productCount[item.itemId] || 0) + item.quantity;
        }
      });
    });

    return Object.entries(productCount)
      .map(([id, count]) => {
        const product = produkList().find(p => p.id === parseInt(id));
        return {
          product: product?.nama || `Produk ID ${id}`, // Fallback if product not found
          sales: count
        };
      })
      .sort((a, b) => b.sales - a.sales);
  });

  const dailyRevenueData = createMemo(() => {
    const revenueByDate: { [key: string]: number } = {};

    invoiceList().forEach(invoice => {
      const date = invoice.tanggal;
      revenueByDate[date] = (revenueByDate[date] || 0) + invoice.totalAmount;
    });

    // Generate dates for the last 30 days to ensure continuity
    const today = new Date();
    const last30DaysData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      last30DaysData.push({
        date: d.getTime(), // AmCharts expects timestamp
        revenue: revenueByDate[dateString] || 0
      });
    }
    return last30DaysData;
  });

  const paymentMethodData = createMemo(() => {
    const methodCount: { [key: string]: number } = {};

    invoiceList().forEach(invoice => {
      methodCount[invoice.paymentMethod] = (methodCount[invoice.paymentMethod] || 0) + 1;
    });

    return Object.entries(methodCount).map(([method, count]) => ({
      method: method,
      count: count
    }));
  });

  // Monthly revenue comparison
  const monthlyRevenueData = createMemo(() => {
    const monthlyRevenue: { [key: string]: number } = {};

    invoiceList().forEach(invoice => {
      const date = new Date(invoice.tanggal);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + invoice.totalAmount;
    });

    // Generate keys for the last 12 months to ensure continuity
    const today = new Date();
    const last12MonthsData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(today.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      last12MonthsData.push({
        month: monthKey,
        revenue: monthlyRevenue[monthKey] || 0
      });
    }

    return last12MonthsData.sort((a, b) => a.month.localeCompare(b.month));
  });

  // Top performing treatments by revenue
  const treatmentRevenueData = createMemo(() => {
    const treatmentRevenue: { [key: number]: number } = {};

    invoiceList().forEach(invoice => {
      invoice.items.forEach(item => {
        if (item.type === 'treatment') {
          treatmentRevenue[item.itemId] = (treatmentRevenue[item.itemId] || 0) + item.subtotal;
        }
      });
    });

    return Object.entries(treatmentRevenue)
      .map(([id, revenue]) => {
        const treatment = treatmentList().find(t => t.id === parseInt(id));
        return {
          treatment: treatment?.nama || `Treatment ID ${id}`, // Fallback if treatment not found
          revenue: revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10
  });

  // Appointment Status Breakdown
  const appointmentStatusData = createMemo(() => {
    const statusCount: { [key: string]: number } = {
      'booked': 0,
      'completed': 0,
      'cancelled': 0,
      'rescheduled': 0
    };

    appointmentList().forEach(appointment => {
      statusCount[appointment.status] = (statusCount[appointment.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
      count: count
    }));
  });

  // Top Patients by Total Spending
  const topPatientsBySpendingData = createMemo(() => {
    const patientSpending: { [key: number]: number } = {};

    invoiceList().forEach(invoice => {
      patientSpending[invoice.pasienId] = (patientSpending[invoice.pasienId] || 0) + invoice.totalAmount;
    });

    return Object.entries(patientSpending)
      .map(([pasienId, totalSpending]) => {
        const pasien = pasienList().find(p => p.id === parseInt(pasienId));
        return {
          pasienName: pasien?.namaLengkap || `Pasien ID ${pasienId}`,
          totalSpending: totalSpending
        };
      })
      .sort((a, b) => b.totalSpending - a.totalSpending)
      .slice(0, 10); // Top 10 patients
  });


  // Chart rendering effects for AmCharts
  createEffect(() => {
    const data = productSalesData();
    if (productChartRef && data.length > 0) {
      if (productRoot) productRoot.dispose();
      productRoot = am5.Root.new(productChartRef);
      productRoot.setThemes([am5themes_Animated.new(productRoot)]);

      let chart = productRoot.container.children.push(am5xy.XYChart.new(productRoot, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: productRoot.verticalLayout
      }));

      let xRenderer = am5xy.AxisRendererX.new(productRoot, {});
      xRenderer.grid.template.setAll({ location: 1 });
      let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(productRoot, {
        categoryField: "product",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(productRoot, {})
      }));
      xAxis.data.setAll(data);

      let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(productRoot, {
        renderer: am5xy.AxisRendererY.new(productRoot, {})
      }));

      let series = chart.series.push(am5xy.ColumnSeries.new(productRoot, {
        name: "Sales",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "sales",
        categoryXField: "product",
        tooltip: am5.Tooltip.new(productRoot, {
          labelText: "{categoryX}: {valueY}"
        })
      }));
      series.columns.template.setAll({
        fill: am5.color("#A855F7"),
        stroke: am5.color("#9333EA"),
        strokeWidth: 2,
        cornerRadiusTL: 5,
        cornerRadiusTR: 5
      });
      series.data.setAll(data);
      series.appear(1000);
      chart.appear(1000, 100);
    } else if (productRoot) {
      productRoot.dispose();
      productRoot = null;
    }
  });

  createEffect(() => {
    const data = paymentMethodData();
    if (paymentChartRef && data.length > 0) {
      if (paymentRoot) paymentRoot.dispose();
      paymentRoot = am5.Root.new(paymentChartRef);
      paymentRoot.setThemes([am5themes_Animated.new(paymentRoot)]);

      let chart = paymentRoot.container.children.push(am5percent.PieChart.new(paymentRoot, {
        layout: paymentRoot.verticalLayout,
        innerRadius: am5.percent(50)
      }));

      let series = chart.series.push(am5percent.PieSeries.new(paymentRoot, {
        valueField: "count",
        categoryField: "method",
        tooltip: am5.Tooltip.new(paymentRoot, {
          labelText: "{category}: {value}"
        })
      }));

      series.slices.template.setAll({
        stroke: am5.color("#ffffff"),
        strokeWidth: 2
      });

      const colors = [
        am5.color("#8B5CF6"), // Purple
        am5.color("#A855F7"), // Light Purple
        am5.color("#C084FC"), // Lighter Purple
        am5.color("#DDD6FE"), // Very Light Purple
      ];

      series.slices.template.adapters.add("fill", (fill, target) => {
        const index = series.slices.indexOf(target);
        return colors[index % colors.length];
      });

      series.data.setAll(data);

      let legend = chart.children.push(am5.Legend.new(paymentRoot, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 15
      }));

      legend.data.setAll(series.dataItems);
      series.appear(1000, 100);
    } else if (paymentRoot) {
      paymentRoot.dispose();
      paymentRoot = null;
    }
  });

  createEffect(() => {
    const data = dailyRevenueData();
    if (revenueChartRef && data.length > 0) {
      if (revenueRoot) revenueRoot.dispose();
      revenueRoot = am5.Root.new(revenueChartRef);
      revenueRoot.setThemes([am5themes_Animated.new(revenueRoot)]);

      let chart = revenueRoot.container.children.push(am5xy.XYChart.new(revenueRoot, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true
      }));

      let xAxis = chart.xAxes.push(am5xy.DateAxis.new(revenueRoot, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(revenueRoot, {}),
        tooltip: am5.Tooltip.new(revenueRoot, {})
      }));

      let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(revenueRoot, {
        renderer: am5xy.AxisRendererY.new(revenueRoot, {}),
        tooltip: am5.Tooltip.new(revenueRoot, {})
      }));

      let series = chart.series.push(am5xy.LineSeries.new(revenueRoot, {
        name: "Revenue",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "revenue",
        valueXField: "date",
        tooltip: am5.Tooltip.new(revenueRoot, {
          labelText: "{valueX.formatDate('dd MMM yyyy')}: {valueY}"
        })
      }));
      series.strokes.template.setAll({
        strokeWidth: 3,
        stroke: am5.color("#7C3AED")
      });
      series.fills.template.setAll({
        fillOpacity: 0.2,
        visible: true,
        fill: am5.color("#8B5CF6")
      });
      series.data.setAll(data);

      let cursor = chart.set("cursor", am5xy.XYCursor.new(revenueRoot, {}));
      cursor.lineY.set("visible", false);

      chart.set("scrollbarX", am5.Scrollbar.new(revenueRoot, {
        orientation: "horizontal"
      }));

      series.appear(1000);
      chart.appear(1000, 100);
    } else if (revenueRoot) {
      revenueRoot.dispose();
      revenueRoot = null;
    }
  });


  // Cleanup AmCharts roots on component unmount
  onCleanup(() => {
    if (productRoot) productRoot.dispose();
    if (paymentRoot) paymentRoot.dispose();
    if (revenueRoot) revenueRoot.dispose();
  });

  // Helper functions (moved inside component as per user's original code structure)
  const getStockStatus = (stok: number) => {
    if (stok <= 10) return { text: 'Stok Rendah', color: 'text-red-600 bg-red-100' };
    if (stok <= 20) return { text: 'Stok Sedang', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Stok Aman', color: 'text-green-600 bg-green-100' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'booked': return 'text-blue-600 bg-blue-100'; // Added for clarity
      case 'rescheduled': return 'text-orange-600 bg-orange-100'; // Added for clarity
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div class="p-6 bg-purple-50 min-h-screen font-inter">
      {/* Header */}
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-purple-800 mb-2">Statistik Klinik</h1>
        <p class="text-purple-600">Dashboard analisis performa operasional klinik kecantikan</p>
      </div>

      {/* Filter Periode */}
      <div class="mb-6">
        <select
          value={selectedPeriod()}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          class="px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
        >
          <option value="7">7 Hari Terakhir</option>
          <option value="30">30 Hari Terakhir</option>
          <option value="90">90 Hari Terakhir</option>
        </select>
      </div>

      {/* Statistik Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold mb-2">Total Revenue</h3>
          <p class="text-3xl font-bold">{formatCurrency(basicStats().totalRevenue)}</p>
          <p class="text-purple-100 text-sm mt-1">Dalam {selectedPeriod()} hari terakhir</p>
        </div>

        <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold mb-2">Total Appointments</h3>
          <p class="text-3xl font-bold">{basicStats().totalAppointments}</p>
          <p class="text-purple-100 text-sm mt-1">Janji temu terjadwal</p>
        </div>

        <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold mb-2">Rata-rata Transaksi</h3>
          <p class="text-3xl font-bold">{formatCurrency(basicStats().averageRevenuePerTransaction)}</p>
          <p class="text-purple-100 text-sm mt-1">Per transaksi</p>
        </div>

        <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold mb-2">Total Patients</h3>
          <p class="text-3xl font-bold">{basicStats().totalPatients}</p>
          <p class="text-purple-100 text-sm mt-1">Pasien terdaftar</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-4 text-purple-800">Produk Terlaris</h3>
          <div ref={productChartRef} style={{ width: "100%", height: "400px" }}></div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-4 text-purple-800">Metode Pembayaran</h3>
          <div ref={paymentChartRef} style={{ width: "100%", height: "400px" }}></div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div class="grid grid-cols-1 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-4 text-purple-800">Revenue Harian</h3>
          <div ref={revenueChartRef} style={{ width: "100%", height: "400px" }}></div>
        </div>
      </div>

      {/* Tables Row 1 - Full width */}
      <div class="grid grid-cols-1 gap-6 mb-8">
        {/* Tabel Stok Produk - Full width */}
        <div class="bg-white p-6 rounded-lg shadow-md w-full">
          <h3 class="text-lg font-semibold mb-4 text-purple-800">Status Stok Produk</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left table-auto">
              <thead>
                <tr class="bg-purple-100">
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold rounded-tl-lg">Nama Produk</th>
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold">Stok</th>
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {produkList().map((produk, index) => {
                  const status = getStockStatus(produk.stok);
                  return (
                    <tr class={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td class="px-6 py-4 text-gray-800">{produk.nama}</td>
                      <td class="px-6 py-4 text-gray-800">{produk.stok}</td>
                      <td class="px-6 py-4">
                        <span class={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tables Row 2 - Full width */}
      <div class="grid grid-cols-1 gap-6 mb-8">
        {/* Revenue by Treatment - Full width */}
        <div class="bg-white p-6 rounded-lg shadow-md w-full">
          <h3 class="text-lg font-semibold mb-4 text-purple-800">Treatment dengan Revenue Tertinggi</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left table-auto">
              <thead>
                <tr class="bg-purple-100">
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold rounded-tl-lg">Treatment</th>
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold rounded-tr-lg">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {treatmentRevenueData().map((item, index) => (
                  <tr class={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td class="px-6 py-4 text-gray-800">{item.treatment}</td>
                    <td class="px-6 py-4 text-gray-800">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tables Row 3 - Full width */}
      <div class="grid grid-cols-1 gap-6 mb-8">
        {/* Monthly Revenue Comparison - Full width */}
        <div class="bg-white p-6 rounded-lg shadow-md w-full">
          <h3 class="text-lg font-semibold mb-4 text-purple-800">Perbandingan Revenue Bulanan</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left table-auto">
              <thead>
                <tr class="bg-purple-100">
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold rounded-tl-lg">Bulan</th>
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold rounded-tr-lg">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenueData().map((item, index) => (
                  <tr class={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td class="px-6 py-4 text-gray-800">
                      {new Date(item.month + '-01').toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </td>
                    <td class="px-6 py-4 text-gray-800">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Table: Appointment Status Breakdown */}
      <div class="grid grid-cols-1 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md w-full">
          <h3 class="text-lg font-semibold mb-4 text-purple-800">Ringkasan Status Janji Temu</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left table-auto">
              <thead>
                <tr class="bg-purple-100">
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold rounded-tl-lg">Status</th>
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold rounded-tr-lg">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {appointmentStatusData().map((item, index) => (
                  <tr class={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td class="px-6 py-4 text-gray-800">
                      <span class={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status.toLowerCase())}`}>
                        {item.status}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-gray-800">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Table: Top Patients by Spending */}
      <div class="grid grid-cols-1 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md w-full">
          <h3 class="text-lg font-semibold mb-4 text-purple-800">Pasien dengan Pengeluaran Tertinggi</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left table-auto">
              <thead>
                <tr class="bg-purple-100">
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold rounded-tl-lg">Nama Pasien</th>
                  <th class="px-6 py-3 text-left text-purple-700 font-semibold rounded-tr-lg">Total Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {topPatientsBySpendingData().map((item, index) => (
                  <tr class={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td class="px-6 py-4 text-gray-800">{item.pasienName}</td>
                    <td class="px-6 py-4 text-gray-800">{formatCurrency(item.totalSpending)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Statistik;