import { createSignal, onMount, For, Component, createMemo, Show } from 'solid-js';
import { Appointment, Pasien, Treatment, Produk, Invoice, InvoiceItem } from '../types/database';
import toast, { Toaster } from 'solid-toast';
import { ShoppingCart, DollarSign, User, PlusCircle, Trash2, Printer } from 'lucide-solid';
import dayjs from 'dayjs';
import api from '../api/api'; // Pastikan path ini benar

const CheckoutPage: Component = () => {
    // --- State ---
    const [invoiceList, setInvoiceList] = createSignal<Invoice[]>([]);
    const [completedAppointments, setCompletedAppointments] = createSignal<Appointment[]>([]);
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<Treatment[]>([]);
    const [productList, setProductList] = createSignal<Produk[]>([]);
    const [loading, setLoading] = createSignal(false);
    
    const [activeInvoice, setActiveInvoice] = createSignal<Partial<Invoice> | null>(null);
    const [amountPaid, setAmountPaid] = createSignal(0);

    // --- Data Loading ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [invoicesRes, appointmentsRes, pasiensRes, treatmentsRes, productsRes] = await Promise.all([
                api.get('/invoices'),
                api.get('/appointments', { params: { status: 'completed' } }), // Filter appointments by status
                api.get('/pasiens'),
                api.get('/treatments'),
                api.get('/produks'),
            ]);
            setInvoiceList(invoicesRes.data);
            setCompletedAppointments(appointmentsRes.data);
            setPasienList(pasiensRes.data);
            setTreatmentList(treatmentsRes.data);
            setProductList(productsRes.data);
        } catch (error) {
            console.error("Gagal memuat data:", error);
            toast.error("Gagal memuat data dari server.");
        } finally {
            setLoading(false);
        }
    };

    onMount(() => {
        fetchData();
    });

    // --- Memoized Calculations ---
    const totalAmount = createMemo(() => activeInvoice()?.items?.reduce((sum, item) => sum + item.subtotal, 0) ?? 0);
    const changeAmount = createMemo(() => (amountPaid() > 0 ? amountPaid() - totalAmount() : 0));

    // --- Handlers ---
    const createInvoiceFromAppointment = (app: Appointment) => {
        const treatments = treatmentList().filter(t => app.treatment_ids.includes(t.id));
        const invoiceItems: InvoiceItem[] = treatments.map(t => ({
            type: 'treatment',
            item_id: t.id,
            name: t.nama,
            quantity: 1,
            price_per_unit: t.harga,
            subtotal: t.harga,
        }));
        
        setActiveInvoice({
            appointment_id: app.id,
            pasien_id: app.pasien_id,
            items: invoiceItems,
            status: 'pending',
            payment_method: 'Cash',
        });
        setAmountPaid(0);
    };

    const handleAddProduct = (e: Event) => {
        const productId = (e.target as HTMLSelectElement).value;
        if (!productId) return;
        const product = productList().find(p => p.id === productId);
        if (product && activeInvoice()) {
            const newItem: InvoiceItem = {
                type: 'product',
                item_id: product.id,
                name: product.nama,
                quantity: 1,
                price_per_unit: product.harga,
                subtotal: product.harga,
            };
            setActiveInvoice(prev => ({ ...prev, items: [...(prev?.items || []), newItem] }));
        }
        (e.target as HTMLSelectElement).value = '';
    };

    const handleRemoveItem = (index: number) => {
        setActiveInvoice(prev => {
            const newItems = [...(prev?.items || [])];
            newItems.splice(index, 1);
            return { ...prev, items: newItems };
        });
    };

    const finishPayment = async () => {
        if (!activeInvoice() || !activeInvoice()!.pasien_id) {
            toast.error("Tidak ada invoice aktif.");
            return;
        }
        if (amountPaid() < totalAmount()) {
            toast.error("Jumlah bayar kurang dari total tagihan.");
            return;
        }

        setLoading(true);

        try {
            const finalInvoice = {
                ...activeInvoice(),
                total_amount: totalAmount(),
                amount_paid: amountPaid(),
                change: changeAmount(),
                tanggal: dayjs().format('YYYY-MM-DD'),
                waktu: dayjs().format('HH:mm:ss'),
                status: 'paid',
                kasir_name: 'Admin',
            };

            // Post invoice to API
            await api.post('/invoices', finalInvoice);

            // Update appointment status to 'paid' via API
            await api.patch(`/appointments/${activeInvoice()!.appointment_id}`, { status: 'paid' });

            toast.success("Pembayaran berhasil! Invoice berhasil disimpan.");
            
            // Refresh data from the server
            await fetchData();
            
            // Clear active invoice
            setActiveInvoice(null);
            setAmountPaid(0);

        } catch (error) {
            console.error("Gagal menyelesaikan pembayaran:", error);
            toast.error("Gagal menyelesaikan pembayaran. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    // Filter dan sort invoice history
    const paidInvoices = createMemo(() => 
        invoiceList()
            .filter(inv => inv.status === 'paid')
            .sort((a, b) => dayjs(b.tanggal + ' ' + b.waktu).unix() - dayjs(a.tanggal + ' ' + a.waktu).unix()) // Sort by newest first
    );

    // Helper untuk mencari nama pasien
    const getPasienName = (pasienId: string) => {
        const pasien = pasienList().find(p => p.id === pasienId);
        return pasien?.nama_lengkap || 'Pasien Tidak Ditemukan';
    };

    return (
        <div class="p-8 bg-gray-50 min-h-screen">
            <Toaster position="top-center"/>
            <h1 class="text-3xl font-bold mb-6 text-gray-800">Kasir & Pembayaran</h1>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Queue */}
                <div class="lg:col-span-1 bg-white p-4 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-4 flex items-center">
                        <User class="mr-2 text-purple-600" size={20}/>
                        Antrian Pembayaran
                    </h2>
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        <Show when={!loading()} fallback={<p class="text-center text-gray-500">Memuat...</p>}>
                            <For each={completedAppointments()} fallback={
                                <div class="text-center text-gray-500 py-8">
                                    <ShoppingCart size={48} class="mx-auto mb-2 text-gray-300"/>
                                    <p>Tidak ada antrian pembayaran.</p>
                                </div>
                            }>
                                {(app) => {
                                    const pasien = pasienList().find(p => p.id === app.pasien_id);
                                    return (
                                        <div
                                            class={`p-3 rounded-md cursor-pointer transition-all duration-200 ${
                                                activeInvoice()?.appointment_id === app.id 
                                                    ? 'bg-purple-600 text-white shadow-lg' 
                                                    : 'bg-gray-100 hover:bg-purple-100 hover:shadow-md'
                                            }`}
                                            onClick={() => createInvoiceFromAppointment(app)}
                                        >
                                            <div class="font-bold">{pasien?.nama_lengkap || 'Unknown'}</div>
                                            <div class="text-sm opacity-75">
                                                {dayjs(app.tanggal).format("DD/MM/YYYY")}
                                            </div>
                                        </div>
                                    );
                                }}
                            </For>
                        </Show>
                    </div>
                </div>

                {/* Billing Details */}
                <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <Show when={activeInvoice()} fallback={
                        <div class="text-center text-gray-500 h-full flex flex-col items-center justify-center py-20">
                            <DollarSign size={64} class="mb-4 text-gray-300"/>
                            <p class="text-lg">Pilih antrian untuk membuat invoice</p>
                        </div>
                    }>
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-purple-700">Invoice</h2>
                            <p class="text-sm text-gray-600">
                                Pasien: <span class="font-semibold">{getPasienName(activeInvoice()!.pasien_id!)}</span>
                            </p>
                        </div>

                        {/* Invoice Items */}
                        <div class="space-y-2 mb-6 max-h-64 overflow-y-auto">
                            <For each={activeInvoice()?.items}>
                                {(item, i) => (
                                    <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <div class="flex-grow">
                                            <p class="font-semibold text-gray-800">{item.name}</p>
                                            <p class="text-sm text-gray-600">
                                                {item.quantity} x Rp {item.price_per_unit.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <p class="font-semibold text-purple-700 mr-4">
                                            Rp {item.subtotal.toLocaleString('id-ID')}
                                        </p>
                                        <button 
                                            onClick={() => handleRemoveItem(i())} 
                                            class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                )}
                            </For>
                        </div>

                        {/* Add Product */}
                        <div class="mb-6 p-4 bg-purple-50 rounded-lg">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tambah Produk</label>
                            <select 
                                onChange={handleAddProduct} 
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">-- Pilih Produk --</option>
                                <For each={productList()}>
                                    {(product) => (
                                        <option value={product.id}>
                                            {product.nama} - Rp {product.harga.toLocaleString('id-ID')}
                                        </option>
                                    )}
                                </For>
                            </select>
                        </div>
                        
                        {/* Totals & Payment */}
                        <div class="border-t-2 border-dashed border-gray-200 pt-6">
                            <div class="space-y-2 text-lg mb-6">
                                <div class="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>Rp {totalAmount().toLocaleString('id-ID')}</span>
                                </div>
                                <div class="flex justify-between font-bold text-2xl text-purple-700 border-t pt-2">
                                    <span>TOTAL</span>
                                    <span>Rp {totalAmount().toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah Bayar</label>
                                    <input 
                                        type="number" 
                                        placeholder="0" 
                                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                                        value={amountPaid()} 
                                        onInput={(e) => setAmountPaid(parseFloat(e.currentTarget.value) || 0)} 
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                                    <select 
                                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                                        onChange={(e) => setActiveInvoice(p => ({...p, payment_method: e.currentTarget.value}))}
                                    >
                                        <option>Cash</option>
                                        <option>Debit</option>
                                        <option>Credit Card</option>
                                        <option>QRIS</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="text-right mb-4">
                                <span class="text-lg font-semibold text-green-600">
                                    Kembalian: Rp {changeAmount() >= 0 ? changeAmount().toLocaleString('id-ID') : '0'}
                                </span>
                            </div>
                            
                            <button 
                                onClick={finishPayment} 
                                class="w-full py-4 text-lg font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                disabled={amountPaid() < totalAmount() || loading()}
                            >
                                <DollarSign class="mr-2" size={20}/> 
                                {loading() ? 'Memproses...' : 'Bayar & Selesaikan'}
                            </button>
                        </div>
                    </Show>
                </div>
            </div>

            {/* Payment History */}
            <div class="mt-8 bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4 flex items-center">
                    <Printer class="mr-2 text-purple-600" size={20}/>
                    Riwayat Pembayaran
                </h2>
                
                <Show when={paidInvoices().length > 0} fallback={
                    <div class="text-center text-gray-500 py-8">
                        <p>Belum ada riwayat pembayaran.</p>
                    </div>
                }>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm border-collapse border border-gray-200">
                            <thead class="bg-purple-100">
                                <tr>
                                    <th class="p-3 text-left border border-gray-200 font-semibold">Tanggal</th>
                                    <th class="p-3 text-left border border-gray-200 font-semibold">Waktu</th>
                                    <th class="p-3 text-left border border-gray-200 font-semibold">Pasien</th>
                                    <th class="p-3 text-left border border-gray-200 font-semibold">Total</th>
                                    <th class="p-3 text-left border border-gray-200 font-semibold">Dibayar</th>
                                    <th class="p-3 text-left border border-gray-200 font-semibold">Kembalian</th>
                                    <th class="p-3 text-left border border-gray-200 font-semibold">Metode</th>
                                    <th class="p-3 text-left border border-gray-200 font-semibold">Kasir</th>
                                </tr>
                            </thead>
                            <tbody>
                                <For each={paidInvoices()}>
                                    {(inv) => (
                                        <tr class="hover:bg-gray-50 transition-colors">
                                            <td class="p-3 border border-gray-200">
                                                {dayjs(inv.tanggal).format('DD/MM/YYYY')}
                                            </td>
                                            <td class="p-3 border border-gray-200">{inv.waktu}</td>
                                            <td class="p-3 border border-gray-200 font-medium">
                                                {getPasienName(inv.pasien_id)}
                                            </td>
                                            <td class="p-3 border border-gray-200 font-semibold text-purple-700">
                                                Rp {inv.total_amount.toLocaleString('id-ID')}
                                            </td>
                                            <td class="p-3 border border-gray-200">
                                                Rp {inv.amount_paid.toLocaleString('id-ID')}
                                            </td>
                                            <td class="p-3 border border-gray-200 text-green-600">
                                                Rp {(inv.change_amount ?? 0).toLocaleString('id-ID')}
                                            </td>
                                            <td class="p-3 border border-gray-200">
                                                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                    {inv.payment_method}
                                                </span>
                                            </td>
                                            <td class="p-3 border border-gray-200">{inv.kasir_name}</td>
                                        </tr>
                                    )}
                                </For>
                            </tbody>
                        </table>
                    </div>
                </Show>
            </div>
        </div>
    );
};

export default CheckoutPage;