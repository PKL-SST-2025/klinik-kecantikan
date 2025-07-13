// src/pages/pembayaran.tsx
import { createSignal, onMount, For, Component, createMemo, Show } from 'solid-js';
import { Appointment, Pasien, Treatment, Produk, Invoice, InvoiceItem } from '../types/database';
import toast, { Toaster } from 'solid-toast';
import { ShoppingCart, DollarSign, User, PlusCircle, Trash2, Printer } from 'lucide-solid';
import dayjs from 'dayjs';

const CheckoutPage: Component = () => {
    // --- State ---
    const [invoiceList, setInvoiceList] = createSignal<Invoice[]>([]);
    const [completedAppointments, setCompletedAppointments] = createSignal<Appointment[]>([]);
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<Treatment[]>([]);
    const [productList, setProductList] = createSignal<Produk[]>([]);
    
    const [activeInvoice, setActiveInvoice] = createSignal<Partial<Invoice> | null>(null);
    const [amountPaid, setAmountPaid] = createSignal(0);

    // --- Data Loading ---
    onMount(() => {
        const storedAppointments = localStorage.getItem('appointmentList');
        if (storedAppointments) {
            setCompletedAppointments(JSON.parse(storedAppointments).filter((a: Appointment) => a.status === 'completed'));
        }
        // Load other necessary data...
        const storedPasien = localStorage.getItem('pasienList');
        if (storedPasien) setPasienList(JSON.parse(storedPasien));
        const storedTreatments = localStorage.getItem('treatmentList');
        if (storedTreatments) setTreatmentList(JSON.parse(storedTreatments));
        const storedProduk = localStorage.getItem('produkList');
        if (storedProduk) setProductList(JSON.parse(storedProduk));
        const storedInvoices = localStorage.getItem('invoiceList');
        if (storedInvoices) setInvoiceList(JSON.parse(storedInvoices));
    });

    // --- Memoized Calculations ---
    const totalAmount = createMemo(() => activeInvoice()?.items?.reduce((sum, item) => sum + item.subtotal, 0) ?? 0);
    const changeAmount = createMemo(() => (amountPaid() > 0 ? amountPaid() - totalAmount() : 0));

    // --- Handlers ---
    const createInvoiceFromAppointment = (app: Appointment) => {
        const treatments = treatmentList().filter(t => app.treatmentIds.includes(t.id));
        const invoiceItems: InvoiceItem[] = treatments.map(t => ({
            type: 'treatment',
            itemId: t.id,
            name: t.nama,
            quantity: 1,
            pricePerUnit: t.harga,
            subtotal: t.harga,
        }));
        
        setActiveInvoice({
            appointmentId: app.id,
            pasienId: app.pasienId,
            items: invoiceItems,
            status: 'pending',
            paymentMethod: 'Cash',
        });
        setAmountPaid(0);
    };

    const handleAddProduct = (e: Event) => {
        const productId = parseInt((e.target as HTMLSelectElement).value);
        if (!productId) return;
        const product = productList().find(p => p.id === productId);
        if (product && activeInvoice()) {
            const newItem: InvoiceItem = {
                type: 'product',
                itemId: product.id,
                name: product.nama,
                quantity: 1,
                pricePerUnit: product.harga,
                subtotal: product.harga,
            };
            setActiveInvoice(prev => ({ ...prev, items: [...(prev?.items || []), newItem] }));
        }
        (e.target as HTMLSelectElement).value = '0';
    };

    const handleRemoveItem = (index: number) => {
        setActiveInvoice(prev => {
            const newItems = [...(prev?.items || [])];
            newItems.splice(index, 1);
            return { ...prev, items: newItems };
        });
    };

    const finishPayment = () => {
        if (!activeInvoice() || !activeInvoice()!.pasienId) {
            toast.error("Tidak ada invoice aktif.");
            return;
        }
        if (amountPaid() < totalAmount()) {
            toast.error("Jumlah bayar kurang dari total tagihan.");
            return;
        }

        const finalInvoice: Invoice = {
            id: Date.now(),
            tanggal: dayjs().format('YYYY-MM-DD'),
            waktu: dayjs().format('HH:mm'),
            totalAmount: totalAmount(),
            amountPaid: amountPaid(),
            change: changeAmount(),
            status: 'paid',
            kasirName: 'Admin', // Placeholder
            ...activeInvoice(),
        } as Invoice;

        // Save invoice
        const updatedInvoices = [...invoiceList(), finalInvoice];
        setInvoiceList(updatedInvoices);
        localStorage.setItem('invoiceList', JSON.stringify(updatedInvoices));

        // Remove appointment from completed list
        const updatedAppointments = JSON.parse(localStorage.getItem('appointmentList') || '[]')
            .filter((a: Appointment) => a.id !== activeInvoice()!.appointmentId);
        localStorage.setItem('appointmentList', JSON.stringify(updatedAppointments));

        // Update UI
        setCompletedAppointments(prev => prev.filter(a => a.id !== activeInvoice()!.appointmentId));
        setActiveInvoice(null);
        setAmountPaid(0);

        toast.success("Pembayaran berhasil!");
    };
    

    return (
        <div class="p-8 bg-gray-50">
            <Toaster position="top-center"/>
            <h1 class="text-3xl font-bold mb-6 text-gray-800">Kasir & Pembayaran</h1>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Payment Queue */}
                <div class="md:col-span-1 bg-white p-4 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-4">Antrian Pembayaran</h2>
                    <ul class="space-y-2">
                        <For each={completedAppointments()} fallback={<li class="text-gray-500">Tidak ada antrian.</li>}>
                            {(app) => {
                                const pasien = pasienList().find(p => p.id === app.pasienId);
                                return (
                                <li
                                    class={`p-3 rounded-md cursor-pointer transition-all ${activeInvoice()?.appointmentId === app.id ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-purple-100'}`}
                                    onClick={() => createInvoiceFromAppointment(app)}
                                >
                                    <div class="font-bold">{pasien?.namaLengkap || 'Unknown'}</div>
                                    <div class="text-sm">Tanggal: {dayjs(app.tanggal).format("DD/MM/YYYY")}</div>
                                </li>
                                )
                            }}
                        </For>
                    </ul>
                </div>

                {/* Billing Details */}
                <div class="md:col-span-2 bg-white p-6 rounded-lg shadow">
                     <Show when={activeInvoice()} fallback={<div class="text-center text-gray-500 h-full flex items-center justify-center">Pilih antrian untuk membuat invoice.</div>}>
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-2xl font-bold">Invoice</h2>
                            <p class="text-sm text-gray-500">Pasien: {pasienList().find(p => p.id === activeInvoice()?.pasienId)?.namaLengkap}</p>
                        </div>

                        {/* Invoice Items */}
                        <div class="space-y-2 mb-4 max-h-64 overflow-y-auto pr-2">
                            <For each={activeInvoice()?.items}>
                                {(item, i) => (
                                    <div class="flex items-center p-2 bg-gray-50 rounded">
                                        <div class="flex-grow">
                                            <p class="font-semibold">{item.name}</p>
                                            <p class="text-sm text-gray-600">{item.quantity} x {item.pricePerUnit.toLocaleString('id-ID')}</p>
                                        </div>
                                        <p class="font-semibold mr-4">Rp {item.subtotal.toLocaleString('id-ID')}</p>
                                        <button onClick={() => handleRemoveItem(i())} class="text-red-500 hover:text-red-700">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                )}
                            </For>
                        </div>

                        {/* Add Product */}
                        <div class="flex items-center mt-3 pt-3 border-t">
                            <select onChange={handleAddProduct} class="w-full p-2 border rounded-md">
                                <option value="0">-- Tambah Produk --</option>
                                <For each={productList()}>
                                    {(product) => <option value={product.id}>{product.nama} - Rp {product.harga.toLocaleString('id-ID')}</option>}
                                </For>
                            </select>
                        </div>
                        
                        {/* Totals & Payment */}
                        <div class="mt-6 pt-4 border-t-2 border-dashed">
                             <div class="space-y-2 text-lg">
                                 <div class="flex justify-between"><span>Subtotal</span><span>Rp {totalAmount().toLocaleString('id-ID')}</span></div>
                                 <div class="flex justify-between font-bold text-2xl text-purple-700"><span>TOTAL</span><span>Rp {totalAmount().toLocaleString('id-ID')}</span></div>
                             </div>
                             <div class="mt-4 grid grid-cols-2 gap-4">
                                 <input type="number" placeholder="Jumlah Bayar" class="p-2 border rounded" value={amountPaid()} onInput={(e) => setAmountPaid(parseFloat(e.currentTarget.value) || 0)} />
                                 <select class="p-2 border rounded" onChange={(e) => setActiveInvoice(p => ({...p, paymentMethod: e.currentTarget.value}))}>
                                     <option>Cash</option>
                                     <option>Debit</option>
                                     <option>Credit Card</option>
                                     <option>QRIS</option>
                                 </select>
                             </div>
                             <div class="mt-2 text-right font-semibold">
                                 Kembalian: Rp {changeAmount() >= 0 ? changeAmount().toLocaleString('id-ID') : '0'}
                             </div>
                             <button onClick={finishPayment} class="w-full mt-4 py-3 text-lg bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center">
                                 <DollarSign class="mr-2"/> Bayar & Selesaikan
                             </button>
                        </div>
                     </Show>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;