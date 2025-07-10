import { Component, createSignal, onMount, For, Show, createMemo, createEffect,  } from 'solid-js';
import toast, { Toaster } from 'solid-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/id'; // For Indonesian locale
import { ShoppingCart, Calendar, DollarSign, Wallet, ClipboardList, User, Package, CircleCheck, XCircle, Printer } from 'lucide-solid';

// Import interfaces
import { Appointment, Pasien, Treatment, Produk, Invoice, InvoiceItem } from '../types/database';

dayjs.locale('id'); // Set locale globally

const CheckoutPage: Component = () => {
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<Treatment[]>([]);
    const [produkList, setProdukList] = createSignal<Produk[]>([]); // Data produk
    const [invoiceList, setInvoiceList] = createSignal<Invoice[]>([]); // Daftar invoice yang sudah dibuat

    const [selectedPasienId, setSelectedPasienId] = createSignal<number | null>(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = createSignal<number | null>(null);
    const [cartItems, setCartItems] = createSignal<InvoiceItem[]>([]);
    const [selectedProductId, setSelectedProductId] = createSignal<number | null>(null);
    const [productQuantity, setProductQuantity] = createSignal(1);

    const [amountPaid, setAmountPaid] = createSignal(0);
    const [paymentMethod, setPaymentMethod] = createSignal('Cash');

    // --- OnMount: Load data from localStorage ---
    onMount(() => {
        const storedAppointment = localStorage.getItem('appointmentList');
        const storedPasien = localStorage.getItem('pasienList');
        const storedTreatment = localStorage.getItem('treatmentList');
        const storedProduk = localStorage.getItem('produkList');
        const storedInvoice = localStorage.getItem('invoiceList');

        if (storedAppointment) setAppointmentList(JSON.parse(storedAppointment));
        if (storedPasien) setPasienList(JSON.parse(storedPasien));
        if (storedTreatment) setTreatmentList(JSON.parse(storedTreatment));
        if (storedProduk) setProdukList(JSON.parse(storedProduk));
        if (storedInvoice) setInvoiceList(JSON.parse(storedInvoice));
    });

    // --- CreateEffect: Save data to localStorage when it changes ---
    createEffect(() => {
        localStorage.setItem('produkList', JSON.stringify(produkList()));
    });
    createEffect(() => {
        localStorage.setItem('invoiceList', JSON.stringify(invoiceList()));
    });

        // --- Helper Functions for Data Display ---
    const getPasienName = (id: number) => pasienList().find(p => p.id === id)?.namaLengkap || 'Pasien Tidak Ditemukan';

    // TAMBAHKAN FUNGSI INI
    const getTreatmentNames = (ids: number[]) => {
        return ids.map(id => treatmentList().find(t => t.id === id)?.nama || 'N/A').join(', ');
    };

     const getStatusClass = (status: string) => {
        switch (status) {
            case 'booked': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
            case 'paid': return 'bg-purple-100 text-purple-800'; // Tambahkan untuk status 'paid' di invoice
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const selectedPasien = createMemo(() => {
        return pasienList().find(p => p.id === selectedPasienId());
    });

    const totalAmount = createMemo(() => {
        return cartItems().reduce((sum, item) => sum + item.subtotal, 0);
    });

    const changeDue = createMemo(() => {
        return amountPaid() - totalAmount();
    });

    // Get appointments that are 'completed' and not yet linked to an invoice, or 'booked'
    const availableAppointments = createMemo(() => {
        return appointmentList().filter(appt => {
            const isCompleted = appt.status === 'completed';
            const isBooked = appt.status === 'booked'; // Allow booking payment upfront
            const isNotYetInvoiced = !invoiceList().some(inv => inv.appointmentId === appt.id);
            return (isCompleted || isBooked) && isNotYetInvoiced;
        });
    });

    // --- Handlers ---
    const handlePasienSelect = (e: Event) => {
        const id = parseInt((e.target as HTMLSelectElement).value);
        setSelectedPasienId(id);
        setSelectedAppointmentId(null); // Reset appointment selection
        setCartItems([]); // Clear cart
    };

    const handleAppointmentSelect = (e: Event) => {
        const id = parseInt((e.target as HTMLSelectElement).value);
        setSelectedAppointmentId(id);
        const appt = appointmentList().find(a => a.id === id);

        if (appt) {
            setSelectedPasienId(appt.pasienId); // Automatically select patient for this appointment
            const treatmentsInCart: InvoiceItem[] = appt.treatmentIds.map(treatmentId => {
                const treatment = treatmentList().find(t => t.id === treatmentId);
                if (treatment) {
                    return {
                        type: 'treatment',
                        itemId: treatment.id,
                        name: treatment.nama,
                        quantity: 1,
                        pricePerUnit: treatment.harga,
                        subtotal: treatment.harga,
                    };
                }
                return null;
            }).filter(Boolean) as InvoiceItem[]; // Filter out nulls

            setCartItems(treatmentsInCart);
        } else {
            setCartItems([]);
        }
    };

    const handleAddProductToCart = () => {
        if (!selectedProductId() || productQuantity() <= 0) {
            toast.error('Pilih produk dan masukkan kuantitas yang valid.');
            return;
        }

        const product = produkList().find(p => p.id === selectedProductId());
        if (!product) {
            toast.error('Produk tidak ditemukan.');
            return;
        }

        if (productQuantity() > product.stok) {
            toast.error(`Stok ${product.nama} tidak cukup. Stok tersedia: ${product.stok}`);
            return;
        }

        const existingItemIndex = cartItems().findIndex(item => item.type === 'product' && item.itemId === product.id);

        if (existingItemIndex !== -1) {
            // Update quantity if product already in cart
            setCartItems(prev => prev.map((item, index) =>
                index === existingItemIndex
                    ? {
                        ...item,
                        quantity: item.quantity + productQuantity(),
                        subtotal: (item.quantity + productQuantity()) * item.pricePerUnit
                    }
                    : item
            ));
        } else {
            // Add new product to cart
            setCartItems(prev => [
                ...prev,
                {
                    type: 'product',
                    itemId: product.id,
                    name: product.nama,
                    quantity: productQuantity(),
                    pricePerUnit: product.harga,
                    subtotal: productQuantity() * product.harga,
                }
            ]);
        }

        // Reset product selection
        setSelectedProductId(null);
        setProductQuantity(1);
        toast.success(`${product.nama} ditambahkan ke keranjang.`);
    };

    const handleRemoveItem = (indexToRemove: number) => {
        setCartItems(prev => prev.filter((_, index) => index !== indexToRemove));
        toast.success('Item dihapus dari keranjang.');
    };

    const handleProcessPayment = () => {
        if (!selectedPasienId()) {
            toast.error('Silakan pilih pasien terlebih dahulu.');
            return;
        }
        if (cartItems().length === 0) {
            toast.error('Keranjang kosong. Tambahkan item untuk melanjutkan.');
            return;
        }
        if (amountPaid() < totalAmount()) {
            toast.error('Jumlah pembayaran kurang dari total tagihan.');
            return;
        }

        const newInvoice: Invoice = {
            id: Date.now(),
            appointmentId: selectedAppointmentId() || undefined,
            pasienId: selectedPasienId()!,
            tanggal: dayjs().format('YYYY-MM-DD'),
            waktu: dayjs().format('HH:mm'),
            items: cartItems(),
            totalAmount: totalAmount(),
            amountPaid: amountPaid(),
            change: changeDue(),
            paymentMethod: paymentMethod(),
            status: 'paid',
            kasirName: 'Admin Kasir', // In a real app, this would come from authenticated user
        };

        // Update product stock
        setProdukList(prevProducts => prevProducts.map(p => {
            const purchasedItem = cartItems().find(item => item.type === 'product' && item.itemId === p.id);
            if (purchasedItem) {
                return { ...p, stok: p.stok - purchasedItem.quantity };
            }
            return p;
        }));

        setInvoiceList(prev => [...prev, newInvoice]);
        toast.success('Pembayaran berhasil diproses!');
        resetForm();
    };

    const resetForm = () => {
        setSelectedPasienId(null);
        setSelectedAppointmentId(null);
        setCartItems([]);
        setSelectedProductId(null);
        setProductQuantity(1);
        setAmountPaid(0);
        setPaymentMethod('Cash');
    };

    return (
        <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 font-sans">
            <Toaster position="top-right" />

            {/* Header Section */}
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Kasir Klinik</h1>
                <p class="text-gray-600">Proses pembayaran treatment dan penjualan produk.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Patient/Appointment Selection & Cart */}
                <div class="lg:col-span-2 bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8 space-y-6">
                    <h2 class="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <ClipboardList size={24} /> Transaksi Baru
                    </h2>

                    {/* Patient / Appointment Selection */}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="select-pasien" class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><User size={16} /> Pilih Pasien</label>
                            <select
                                id="select-pasien"
                                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={selectedPasienId() || ''}
                                onInput={handlePasienSelect}
                            >
                                <option value="">-- Pilih Pasien --</option>
                                <For each={pasienList()}>
                                    {(pasien) => <option value={pasien.id}>{pasien.namaLengkap}</option>}
                                </For>
                            </select>
                        </div>
                        <div>
                            <label for="select-appointment" class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Calendar size={16} /> Pilih Appointment (Optional)</label>
                            <select
                                id="select-appointment"
                                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={selectedAppointmentId() || ''}
                                onInput={handleAppointmentSelect}
                                disabled={!selectedPasienId()}
                            >
                                <option value="">-- Pilih Appointment --</option>
                                <For each={availableAppointments().filter(appt => appt.pasienId === selectedPasienId())}>
                                    {(appt) => (
                                        <option value={appt.id}>
                                            {dayjs(appt.tanggal).format('DD MMM')} {appt.waktuMulai} - {getTreatmentNames(appt.treatmentIds)} ({appt.status.toUpperCase()})
                                        </option>
                                    )}
                                </For>
                            </select>
                        </div>
                    </div>

                    {/* Cart Items Display */}
                    <div class="mt-6 border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <ShoppingCart size={20} /> Keranjang Belanja
                        </h3>
                        <Show when={cartItems().length > 0} fallback={<p class="text-gray-500 text-sm">Keranjang kosong. Pilih pasien/appointment atau tambahkan produk.</p>}>
                            <div class="space-y-3">
                                <For each={cartItems()}>
                                    {(item, i) => (
                                        <div class="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                            <div class="flex-1">
                                                <p class="font-medium text-gray-800">{item.name}</p>
                                                <p class="text-sm text-gray-600">
                                                    {item.quantity} x Rp {item.pricePerUnit.toLocaleString('id-ID')}
                                                    <span class="ml-2 px-2 py-0.5 rounded-full text-xs" classList={{
                                                        'bg-purple-100 text-purple-700': item.type === 'treatment',
                                                        'bg-green-100 text-green-700': item.type === 'product',
                                                    }}>{item.type.toUpperCase()}</span>
                                                </p>
                                            </div>
                                            <div class="text-right flex items-center gap-3">
                                                <span class="font-semibold text-gray-900">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                                                <button
                                                    onClick={() => handleRemoveItem(i())}
                                                    class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Hapus Item"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </div>

                    {/* Add Product Section */}
                    <div class="mt-6 border border-gray-200 rounded-xl p-4 bg-green-50">
                        <h3 class="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <Package size={20} /> Tambah Produk
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div class="md:col-span-2">
                                <label for="select-product" class="block text-sm font-medium text-gray-700 mb-1">Pilih Produk</label>
                                <select
                                    id="select-product"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={selectedProductId() || ''}
                                    onInput={(e) => setSelectedProductId(parseInt(e.target.value))}
                                >
                                    <option value="">-- Pilih Produk --</option>
                                    <For each={produkList()}>
                                        {(produk) => (
                                            <option value={produk.id} disabled={produk.stok <= 0}>
                                                {produk.nama} (Stok: {produk.stok}) - Rp {produk.harga.toLocaleString('id-ID')}
                                            </option>
                                        )}
                                    </For>
                                </select>
                            </div>
                            <div>
                                <label for="product-quantity" class="block text-sm font-medium text-gray-700 mb-1">Kuantitas</label>
                                <input
                                    type="number"
                                    id="product-quantity"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    min="1"
                                    value={productQuantity()}
                                    onInput={(e) => setProductQuantity(parseInt(e.target.value))}
                                />
                            </div>
                            <button
                                onClick={handleAddProductToCart}
                                class="col-span-full md:col-span-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
                            >
                                <CircleCheck size={20} /> Tambahkan ke Keranjang
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary & Payment */}
                <div class="lg:col-span-1 bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8 space-y-6">
                    <h2 class="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <DollarSign size={24} /> Ringkasan Pembayaran
                    </h2>

                    {/* Total Amount */}
                    <div class="bg-purple-100 p-4 rounded-xl shadow-inner border border-purple-200">
                        <p class="text-lg font-medium text-purple-800">Total Tagihan:</p>
                        <p class="text-4xl font-bold text-purple-900 mt-2">Rp {totalAmount().toLocaleString('id-ID')}</p>
                    </div>

                    {/* Payment Input */}
                    <div class="space-y-4">
                        <div>
                            <label for="amount-paid" class="block text-sm font-medium text-gray-700 mb-1">Jumlah Dibayar</label>
                            <input
                                type="number"
                                id="amount-paid"
                                class="w-full px-3 py-2 border border-gray-300 rounded-xl text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                value={amountPaid()}
                                onInput={(e) => setAmountPaid(parseFloat(e.target.value))}
                            />
                        </div>
                        <div>
                            <label for="payment-method" class="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                            <select
                                id="payment-method"
                                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={paymentMethod()}
                                onInput={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="Cash">Cash</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Debit Card">Debit Card</option>
                                <option value="Transfer">Transfer Bank</option>
                                <option value="E-Wallet">E-Wallet</option>
                            </select>
                        </div>
                    </div>

                    {/* Change Due */}
                    <div class="bg-blue-100 p-4 rounded-xl shadow-inner border border-blue-200">
                        <p class="text-lg font-medium text-blue-800">Kembalian:</p>
                        <p class="text-3xl font-bold text-blue-900 mt-2">Rp {Math.max(0, changeDue()).toLocaleString('id-ID')}</p>
                        <Show when={changeDue() < 0}>
                            <p class="text-red-600 text-sm mt-1">Pembayaran kurang Rp {Math.abs(changeDue()).toLocaleString('id-ID')}</p>
                        </Show>
                    </div>

                    {/* Process Payment Button */}
                    <button
                        onClick={handleProcessPayment}
                        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg text-lg font-semibold"
                        disabled={!selectedPasienId() || cartItems().length === 0 || amountPaid() < totalAmount()}
                    >
                        <Wallet size={24} /> Proses Pembayaran
                    </button>

                    <button
                        onClick={resetForm}
                        class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm"
                    >
                        <XCircle size={20} /> Batalkan Transaksi
                    </button>
                </div>
            </div>

            {/* Invoices History (Simple Display) */}
            <div class="mt-8 bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Printer size={24} /> Riwayat Transaksi
                </h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead class="bg-gray-100 text-gray-800">
                            <tr>
                                <th class="py-3 px-4 text-left text-sm font-semibold">ID Transaksi</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Tanggal</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Pasien</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Total</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Metode Bayar</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show when={invoiceList().length > 0} fallback={
                                <tr><td colSpan={6} class="text-center py-4 text-gray-500">Belum ada riwayat transaksi.</td></tr>
                            }>
                                <For each={invoiceList().sort((a, b) => dayjs(`${b.tanggal} ${b.waktu}`).diff(dayjs(`${a.tanggal} ${a.waktu}`)))}>
                                    {(invoice) => (
                                        <tr class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                            <td class="py-3 px-4 text-gray-800">#{invoice.id}</td>
                                            <td class="py-3 px-4 text-gray-800">{dayjs(invoice.tanggal).format('DD MMM YYYY')} {invoice.waktu}</td>
                                            <td class="py-3 px-4 text-gray-800">{getPasienName(invoice.pasienId)}</td>
                                            <td class="py-3 px-4 text-gray-800">Rp {invoice.totalAmount.toLocaleString('id-ID')}</td>
                                            <td class="py-3 px-4 text-gray-800">{invoice.paymentMethod}</td>
                                            <td class="py-3 px-4">
                                                <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(invoice.status)}`}>
                                                    {invoice.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    )}
                                </For>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;