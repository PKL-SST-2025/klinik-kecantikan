import { createSignal, createEffect, onMount, Show, onCleanup } from 'solid-js';
import api from '../api/api';
import toast from 'solid-toast';

// Import AmCharts 5
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

// Import tipe data yang relevan dari file database.ts
import type { Pasien, Invoice, Appointment, ProdukFromBackend } from '../types/database';

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

// Function to get stock status (kept for potential future use)
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
    // --- State Management ---
    const [selectedPeriod, setSelectedPeriod] = createSignal('30');
    const [isLoading, setIsLoading] = createSignal(true);
    const [dataLoaded, setDataLoaded] = createSignal(false);

    // State untuk menampung data yang diambil dari API
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [invoiceList, setInvoiceList] = createSignal<Invoice[]>([]);
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);
    const [produkList, setProdukList] = createSignal<ProdukFromBackend[]>([]);
    
    // State untuk statistik dasar
    const [basicStats, setBasicStats] = createSignal({
        totalRevenue: 0,
        totalAppointments: 0,
        averageRevenuePerTransaction: 0,
        totalPatients: 0,
    });
    
    // State untuk data grafik
    const [productSalesData, setProductSalesData] = createSignal<any[]>([]);
    const [paymentMethodData, setPaymentMethodData] = createSignal<any[]>([]);
    const [dailyRevenueData, setDailyRevenueData] = createSignal<any[]>([]);
    const [treatmentRevenueData, setTreatmentRevenueData] = createSignal<any[]>([]);

    // References for AmCharts containers
    let productChartRef: HTMLDivElement | undefined;
    let paymentChartRef: HTMLDivElement | undefined;
    let revenueChartRef: HTMLDivElement | undefined;

    // AmCharts root instances
    let productRoot: am5.Root | null = null;
    let paymentRoot: am5.Root | null = null;
    let revenueRoot: am5.Root | null = null;

    // --- Data Fetching Function ---
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pasienRes, invoiceRes, appointmentRes, produkRes] = await Promise.all([
                api.get<Pasien[]>('/pasiens'),
                api.get<Invoice[]>('/invoices'),
                api.get<Appointment[]>('/appointments'),
                api.get<ProdukFromBackend[]>('/products'),
            ]);
            setPasienList(pasienRes.data);
            setInvoiceList(invoiceRes.data);
            setAppointmentList(appointmentRes.data);
            setProdukList(produkRes.data);
            setDataLoaded(true);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Gagal memuat data dashboard. Silakan periksa koneksi server.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Calculation Function ---
    const calculateStats = (period: string) => {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - parseInt(period));

        const filteredInvoices = invoiceList().filter(invoice => {
            const invoiceDate = new Date(invoice.tanggal);
            return invoiceDate >= startDate && invoiceDate <= today;
        });

        const filteredAppointments = appointmentList().filter(appointment => {
            const appointmentDate = new Date(appointment.tanggal);
            return appointmentDate >= startDate && appointmentDate <= today;
        });

        // Basic Stats
        const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
        const totalAppointments = filteredAppointments.length;
        const averageRevenuePerTransaction = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;
        const totalPatients = pasienList().length;

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
            paymentMethodMap.set(invoice.payment_method ?? "Tidak Diketahui", (paymentMethodMap.get(invoice.payment_method ?? "Tidak Diketahui") || 0) + invoice.total_amount);
        });
        setPaymentMethodData(Array.from(paymentMethodMap.entries()).map(([method, amount]) => ({ method, amount })));

        // Daily Revenue Data (for chart)
        const dailyRevenueMap = new Map<string, number>();
        filteredInvoices.forEach(invoice => {
            dailyRevenueMap.set(invoice.tanggal, (dailyRevenueMap.get(invoice.tanggal) || 0) + invoice.total_amount);
        });

        const dailyRevenueArray = [];
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            dailyRevenueArray.push({
                date: d.getTime(),
                revenue: dailyRevenueMap.get(dateString) || 0,
            });
        }
        setDailyRevenueData(dailyRevenueArray);

        // Treatment Revenue Data (calculated but not displayed in the UI)
        const treatmentRevenueMap = new Map<string, number>();
        filteredInvoices.forEach(invoice => {
            invoice.items.filter(item => item.type === 'treatment').forEach(item => {
                treatmentRevenueMap.set(item.name, (treatmentRevenueMap.get(item.name) || 0) + item.subtotal);
            });
        });
        setTreatmentRevenueData(Array.from(treatmentRevenueMap.entries()).map(([treatment, revenue]) => ({ treatment, revenue })));
    };

    // --- Effects ---
    // Run this on component mount to fetch data from the API
    onMount(() => {
        fetchData();
    });

    // Re-calculate stats whenever selectedPeriod or the fetched data changes
    createEffect(() => {
        const period = selectedPeriod();
        if (dataLoaded()) {
            calculateStats(period);
        }
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
                    panX: false,
                    panY: false,
                    wheelX: "none",
                    wheelY: "none",
                    layout: productRoot.verticalLayout
                })
            );

            // Create axes
            let xRenderer = am5xy.AxisRendererX.new(productRoot, {});
            xRenderer.grid.template.setAll({ location: 1 });
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
            
            const productColors = [
                am5.color("#8B5CF6"),
                am5.color("#A855F7"),
                am5.color("#C084FC"),
                am5.color("#E9D5FF"),
                am5.color("#EDE9FE")
            ];
            
            series.columns.template.adapters.add("fill", function(fill, target) {
                return productColors[series.columns.indexOf(target) % productColors.length];
            });
            
            series.data.setAll(productSalesData());
        }

        // Payment Method Chart (Pie Chart)
        if (paymentChartRef && paymentMethodData().length > 0) {
            paymentRoot = am5.Root.new(paymentChartRef);
            paymentRoot.setThemes([am5themes_Animated.new(paymentRoot)]);

            let chart = paymentRoot.container.children.push(
                am5percent.PieChart.new(paymentRoot, {
                    layout: paymentRoot.verticalLayout,
                    innerRadius: am5.percent(50)
                })
            );

            let series = chart.series.push(
                am5percent.PieSeries.new(paymentRoot, {
                    valueField: "amount",
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
            
            const paymentColors = [
                am5.color("#8B5CF6"),
                am5.color("#A855F7"),
                am5.color("#C084FC"),
                am5.color("#DDD6FE")
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
                strokeWidth: 3,
                stroke: am5.color("#7C3AED")
            });
            
            series.fills.template.setAll({
                fillOpacity: 0.2,
                visible: true,
                fill: am5.color("#8B5CF6")
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

            <Show when={!isLoading()} fallback={
                <div class="flex justify-center items-center h-64">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p class="text-purple-600 text-lg">Memuat data dashboard...</p>
                    </div>
                </div>
            }>
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
            </Show>
        </div>
    );
};

export default Dashboard;