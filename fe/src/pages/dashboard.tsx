import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';

// Import data dari localDataStorage.ts
import {
  produkList,
  treatmentList,
  invoiceList,
  appointmentList,
  pasienList,
} from '../stores/localDataStore'; // Pastikan path ini benar

// Import AmCharts 5
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

// --- Helper Functions ---

// Function to format currency to IDR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Function to get stock status (still needed if we want to show it somewhere or for future use, but not directly in this simplified dashboard)
const getStockStatus = (stok: number) => {
  if (stok <= 5) {
    return { text: 'Rendah', color: 'bg-red-100 text-red-800' };
  } else if (stok <= 20) {
    return { text: 'Sedang', color: 'bg-yellow-100 text-yellow-800' };
  } else {
    return { text: 'Aman', color: 'bg-green-100 text-green-800' };
  }
};

// --- Dashboard Component ---
const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = createSignal('30'); // Default to 30 days
  const [basicStats, setBasicStats] = createSignal({
    totalRevenue: 0,
    totalAppointments: 0,
    averageRevenuePerTransaction: 0,
    totalPatients: 0,
  });
  const [productSalesData, setProductSalesData] = createSignal<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = createSignal<any[]>([]);
  const [dailyRevenueData, setDailyRevenueData] = createSignal<any[]>([]);
  const [treatmentRevenueData, setTreatmentRevenueData] = createSignal<any[]>([]); // Masih dihitung, tapi tidak ditampilkan di tabel

  // References for AmCharts containers (now div elements)
  let productChartRef: HTMLDivElement | undefined;
  let paymentChartRef: HTMLDivElement | undefined;
  let revenueChartRef: HTMLDivElement | undefined;

  // AmCharts root instances
  let productRoot: am5.Root | null = null;
  let paymentRoot: am5.Root | null = null;
  let revenueRoot: am5.Root | null = null;

  // Function to calculate statistics based on selected period
  const calculateStats = (period: string) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - parseInt(period));

    // Filter invoices and appointments based on the date range from local storage data
    const filteredInvoices = invoiceList().filter(invoice => {
      const invoiceDate = new Date(invoice.tanggal);
      return invoiceDate >= startDate && invoiceDate <= today;
    });

    const filteredAppointments = appointmentList().filter(appointment => {
      const appointmentDate = new Date(appointment.tanggal);
      return appointmentDate >= startDate && appointmentDate <= today;
    });

    // Basic Stats
    const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalAppointments = filteredAppointments.length;
    const averageRevenuePerTransaction = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;
    const totalPatients = new Set(pasienList().map(p => p.id)).size; // Total unique patients from local storage

    setBasicStats({
      totalRevenue,
      totalAppointments,
      averageRevenuePerTransaction,
      totalPatients,
    });

    // Product Sales Data (for chart)
    const productSalesMap = new Map<string, number>();
    filteredInvoices.forEach(invoice => {
      invoice.items.filter(item => item.type === 'product').forEach(item => {
        productSalesMap.set(item.name, (productSalesMap.get(item.name) || 0) + item.quantity);
      });
    });
    setProductSalesData(Array.from(productSalesMap.entries()).map(([name, quantity]) => ({ name, quantity })));

    // Payment Method Data (for chart)
    const paymentMethodMap = new Map<string, number>();
    filteredInvoices.forEach(invoice => {
      paymentMethodMap.set(invoice.paymentMethod, (paymentMethodMap.get(invoice.paymentMethod) || 0) + invoice.totalAmount);
    });
    setPaymentMethodData(Array.from(paymentMethodMap.entries()).map(([method, amount]) => ({ method, amount })));

    // Daily Revenue Data (for chart)
    const dailyRevenueMap = new Map<string, number>();
    filteredInvoices.forEach(invoice => {
      dailyRevenueMap.set(invoice.tanggal, (dailyRevenueMap.get(invoice.tanggal) || 0) + invoice.totalAmount);
    });

    const dailyRevenueArray = [];
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      // AmCharts expects timestamp for DateAxis
      dailyRevenueArray.push({
        date: d.getTime(), // Convert to timestamp
        revenue: dailyRevenueMap.get(dateString) || 0,
      });
    }
    setDailyRevenueData(dailyRevenueArray);

    // Treatment Revenue Data (still calculated, but not displayed in a table on this simplified dashboard)
    const treatmentRevenueMap = new Map<string, number>();
    filteredInvoices.forEach(invoice => {
      invoice.items.filter(item => item.type === 'treatment').forEach(item => {
        treatmentRevenueMap.set(item.name, (treatmentRevenueMap.get(item.name) || 0) + item.subtotal);
      });
    });
    setTreatmentRevenueData(Array.from(treatmentRevenueMap.entries()).map(([treatment, revenue]) => ({ treatment, revenue })));

    // Monthly Revenue Data (still calculated, but not displayed in a table on this simplified dashboard)
    const monthlyRevenueMap = new Map<string, number>();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    invoiceList().forEach(invoice => {
      const invoiceDate = new Date(invoice.tanggal);
      if (invoiceDate >= sixMonthsAgo && invoiceDate <= today) {
        const monthYear = invoiceDate.toISOString().substring(0, 7);
        monthlyRevenueMap.set(monthYear, (monthlyRevenueMap.get(monthYear) || 0) + invoice.totalAmount);
      }
    });
  };

  // Initial data load and effect for period change
  onMount(() => {
    calculateStats(selectedPeriod());
  });

  // Re-calculate stats whenever selectedPeriod or any of the lists change
  createEffect(() => {
    // Depend on the signals from localDataStorage so the effect re-runs when they update
    const currentProdukList = produkList();
    const currentInvoiceList = invoiceList();
    const currentAppointmentList = appointmentList();
    const currentPasienList = pasienList();

    calculateStats(selectedPeriod());
  });

  // Chart rendering effect for AmCharts
  createEffect(() => {
    // Dispose previous roots if they exist
    if (productRoot) productRoot.dispose();
    if (paymentRoot) paymentRoot.dispose();
    if (revenueRoot) revenueRoot.dispose();

    // Product Sales Chart
    if (productChartRef && productSalesData().length > 0) {
      productRoot = am5.Root.new(productChartRef);
      productRoot.setThemes([am5themes_Animated.new(productRoot)]);

      let chart = productRoot.container.children.push(
        am5xy.XYChart.new(productRoot, {
          panX: false, // Changed to false for simpler bar chart interaction
          panY: false, // Changed to false
          wheelX: "none", // Changed to none
          wheelY: "none", // Changed to none
          layout: productRoot.verticalLayout
        })
      );

      // Create axes
      let xRenderer = am5xy.AxisRendererX.new(productRoot, {});
      xRenderer.grid.template.setAll({
        location: 1
      })
      let xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(productRoot, {
          categoryField: "name",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(productRoot, {})
        })
      );
      xAxis.data.setAll(productSalesData());

      let yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(productRoot, {
          renderer: am5xy.AxisRendererY.new(productRoot, {})
        })
      );

      // Create series
      let series = chart.series.push(
        am5xy.ColumnSeries.new(productRoot, {
          name: "Jumlah Terjual",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "quantity",
          categoryXField: "name",
          tooltip: am5.Tooltip.new(productRoot, {
            labelText: "{categoryX}: {valueY}"
          })
        })
      );
      series.columns.template.setAll({
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0
      });
      // Apply purple colors to product sales chart
      const productColors = [
        am5.color("#8B5CF6"), // Purple-500
        am5.color("#A855F7"), // Purple-400
        am5.color("#C084FC"), // Purple-300
        am5.color("#E9D5FF"), // Purple-200
        am5.color("#EDE9FE"), // Purple-100
      ];
      series.columns.template.adapters.add("fill", function(fill, target) {
        return productColors[series.columns.indexOf(target) % productColors.length];
      });
      series.data.setAll(productSalesData());

      // Add cursor (optional for bar chart if pan/zoom is off)
      // chart.set("cursor", am5xy.XYCursor.new(productRoot, {}));
    }

    // Payment Method Chart (Pie Chart)
    if (paymentChartRef && paymentMethodData().length > 0) {
      paymentRoot = am5.Root.new(paymentChartRef);
      paymentRoot.setThemes([am5themes_Animated.new(paymentRoot)]);

      let chart = paymentRoot.container.children.push(
        am5percent.PieChart.new(paymentRoot, {
          layout: paymentRoot.verticalLayout,
          innerRadius: am5.percent(50) // Added inner radius for donut chart
        })
      );

      let series = chart.series.push(
        am5percent.PieSeries.new(paymentRoot, {
          valueField: "amount", // Changed to 'amount' for revenue distribution
          categoryField: "method",
          alignLabels: false,
          tooltip: am5.Tooltip.new(paymentRoot, {
            labelText: "{category}: {value}"
          })
        })
      );
      series.slices.template.setAll({
        stroke: am5.color(0xffffff),
        strokeWidth: 2,
        strokeOpacity: 1
      });
      series.labels.template.setAll({
        textType: "circular",
        radius: 10
      });
      // Apply purple colors to payment method chart
      const paymentColors = [
        am5.color("#8B5CF6"), // Purple-500
        am5.color("#A855F7"), // Purple-400
        am5.color("#C084FC"), // Purple-300
        am5.color("#DDD6FE"), // Purple-200
      ];
      series.slices.template.adapters.add("fill", (fill, target) => {
        const index = series.slices.indexOf(target);
        return paymentColors[index % paymentColors.length];
      });

      series.data.setAll(paymentMethodData());

      let legend = chart.children.push(am5.Legend.new(paymentRoot, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 15
      }));
      legend.data.setAll(series.dataItems);
    }

    // Daily Revenue Chart (Line Chart)
    if (revenueChartRef && dailyRevenueData().length > 0) {
      revenueRoot = am5.Root.new(revenueChartRef);
      revenueRoot.setThemes([am5themes_Animated.new(revenueRoot)]);

      let chart = revenueRoot.container.children.push(
        am5xy.XYChart.new(revenueRoot, {
          panX: true,
          panY: true,
          wheelX: "panX",
          wheelY: "zoomX",
          pinchZoomX: true
        })
      );

      // Create axes
      let xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(revenueRoot, {
          baseInterval: { timeUnit: "day", count: 1 },
          renderer: am5xy.AxisRendererX.new(revenueRoot, {}),
          tooltip: am5.Tooltip.new(revenueRoot, {})
        })
      );

      let yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(revenueRoot, {
          renderer: am5xy.AxisRendererY.new(revenueRoot, {}),
          tooltip: am5.Tooltip.new(revenueRoot, {})
        })
      );

      // Create series
      let series = chart.series.push(
        am5xy.LineSeries.new(revenueRoot, {
          name: "Revenue Harian",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "revenue",
          valueXField: "date",
          tooltip: am5.Tooltip.new(revenueRoot, {
            labelText: "{valueX.formatDate('dd MMM yyyy')}: {valueY}"
          })
        })
      );
      series.strokes.template.setAll({
        strokeWidth: 3, // Increased stroke width for visibility
        stroke: am5.color("#7C3AED") // Darker purple for the line
      });
      series.fills.template.setAll({
        fillOpacity: 0.2,
        visible: true,
        fill: am5.color("#8B5CF6") // Lighter purple for the fill area
      });
      series.data.setAll(dailyRevenueData());

      // Add cursor
      chart.set("cursor", am5xy.XYCursor.new(revenueRoot, {
        behavior: "zoomX"
      }));

      // Add scrollbar
      chart.set("scrollbarX", am5.Scrollbar.new(revenueRoot, {
        orientation: "horizontal"
      }));
    }
  });

  // Cleanup AmCharts roots on component unmount
  onCleanup(() => {
    if (productRoot) productRoot.dispose();
    if (paymentRoot) paymentRoot.dispose();
    if (revenueRoot) revenueRoot.dispose();
  });


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
          {/* Use a div element for AmCharts */}
          <div ref={productChartRef} style={{ width: "100%", height: "400px" }}></div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-4 text-purple-800">Metode Pembayaran</h3>
          {/* Use a div element for AmCharts */}
          <div ref={paymentChartRef} style={{ width: "100%", height: "400px" }}></div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div class="grid grid-cols-1 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-4 text-purple-800">Revenue Harian</h3>
          {/* Use a div element for AmCharts */}
          <div ref={revenueChartRef} style={{ width: "100%", height: "400px" }}></div>
        </div>
      </div>

      {/* Navigation to detailed pages */}
      <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 class="text-lg font-semibold mb-4 text-purple-800">Lihat Detail Lebih Lanjut</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <a href="/produk" class="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition-colors duration-200">
            Produk & Treatment
          </a>
          <a href="/pasien" class="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition-colors duration-200">
            Data Pasien
          </a>
          <a href="/pembayaran" class="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition-colors duration-200">
            Pembayaran & Invoice
          </a>
          <a href="/jadwal" class="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition-colors duration-200">
            Jadwal & Janji Temu
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;