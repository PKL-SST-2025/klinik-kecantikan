import { createSignal, For, Show, onMount, Component, createMemo } from 'solid-js';
import { Pasien, SkinAnalysis, TreatmentProgress, Appointment, Treatment, Produk } from '../types/database'; 
import { User, FileText, Stethoscope, Activity, Heart, Shield, Pill } from 'lucide-solid';
import toast, { Toaster } from 'solid-toast';
import dayjs from 'dayjs';
import api from '../api/api'; // Pastikan path ini benar

const PasienDataPage: Component = () => {
    // --- State ---
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<Treatment[]>([]);
    const [productList, setProductList] = createSignal<Produk[]>([]);
    const [selectedPasien, setSelectedPasien] = createSignal<Pasien | null>(null);

    // --- Form State ---
    const [analysisFormData, setAnalysisFormData] = createSignal<Partial<SkinAnalysis>>({
        appointment_id: '',
        hasil_visual: '',
        hasil_alat: '',
        rekomendasi_treatment: [],
        rekomendasi_produk: [],
        catatan_tambahan: '',
    });

    const [progressFormData, setProgressFormData] = createSignal<Partial<TreatmentProgress>>({
        appointment_id: '',
        catatan: '',
    });

    const [loading, setLoading] = createSignal(false);

    // --- Data Loading ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [pasiensRes, appointmentsRes, treatmentsRes, productsRes] = await Promise.all([
                api.get('/pasiens'),
                api.get('/appointments'),
                api.get('/treatments'),
                api.get('/produks'),
            ]);
            setPasienList(pasiensRes.data);
            setAppointmentList(appointmentsRes.data);
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

    const patientAppointments = createMemo(() => {
        if (!selectedPasien()) return [];
        return appointmentList().filter(app => app.pasien_id === selectedPasien()!.id);
    });

    // --- Handlers ---
    const handleSelectPasien = (pasien: Pasien) => {
        setSelectedPasien(pasien);
        // Reset forms
        setAnalysisFormData({
            appointment_id: '',
            hasil_visual: '',
            hasil_alat: '',
            rekomendasi_treatment_ids: [],
            rekomendasi_produk_ids: [],
            catatan_tambahan: '',
        });
        setProgressFormData({ appointment_id: '', catatan: '' });
    };

    const handleAddSkinAnalysis = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        const { appointment_id, hasil_visual, hasil_alat } = analysisFormData();

        if (!appointment_id || !hasil_visual || !hasil_alat) {
            toast.error("Appointment, Hasil Visual, dan Hasil Alat wajib diisi.");
            setLoading(false);
            return;
        }

        try {
            const newAnalysisData = {
                ...analysisFormData(),
                tanggal_analisis: dayjs().toISOString(),
            };
            const res = await api.post('/skin_analyses', newAnalysisData);
            toast.success("Hasil Analisis Kulit berhasil ditambahkan!");
            console.log("Analisis baru:", res.data);
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Gagal menambahkan analisis:", error);
            toast.error("Gagal menyimpan analisis. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTreatmentProgress = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        const { appointment_id, catatan } = progressFormData();

        if (!appointment_id || !catatan) {
            toast.error("Appointment dan Catatan Progress wajib diisi.");
            setLoading(false);
            return;
        }

        try {
            const newProgressData = {
                ...progressFormData(),
                tanggal_progress: dayjs().toISOString(),
            };
            const res = await api.post('/treatment_progresses', newProgressData);
            toast.success("Progress Treatment berhasil ditambahkan!");
            console.log("Progress baru:", res.data);
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Gagal menambahkan progress:", error);
            toast.error("Gagal menyimpan progress. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    // --- Render ---
    return (
        <div class="p-8 bg-gray-50 min-h-screen">
            <Toaster position="top-center" />
            <h1 class="text-3xl font-bold mb-6 text-gray-800">Manajemen Data Pasien</h1>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Patient List */}
                <div class="md:col-span-1 bg-white p-4 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-4">Daftar Pasien</h2>
                    <ul class="space-y-2 max-h-[70vh] overflow-y-auto">
                        <Show when={!loading()} fallback={<p class="text-center text-gray-500">Memuat...</p>}>
                            <For each={pasienList()}>
                                {(pasien) => (
                                    <li
                                        class={`p-3 rounded-md cursor-pointer transition-all ${selectedPasien()?.id === pasien.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-purple-100'}`}
                                        onClick={() => handleSelectPasien(pasien)}
                                    >
                                        <div class="font-bold">{pasien.nama_lengkap}</div>
                                        <div class="text-sm">{pasien.no_telepon}</div>
                                    </li>
                                )}
                            </For>
                        </Show>
                    </ul>
                </div>

                {/* Patient Details */}
                <div class="md:col-span-3 space-y-6">
                    <Show when={selectedPasien()} fallback={<div class="bg-white p-10 rounded-lg shadow text-center text-gray-500">Pilih pasien untuk melihat detail.</div>}>
                        <div class="bg-white p-6 rounded-lg shadow">
                            <h2 class="text-2xl font-bold mb-4 text-gray-800">{selectedPasien()?.nama_lengkap}</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                <p><User class="inline mr-2" size={16}/>{selectedPasien()?.email}</p>
                                <p><Heart class="inline mr-2" size={16}/>{dayjs(selectedPasien()?.tanggal_lahir).format('DD MMMM YYYY')} ({selectedPasien()?.jenis_kelamin})</p>
                                <p><Shield class="inline mr-2" size={16}/>Alergi: {selectedPasien()?.riwayat_alergi || '-'}</p>
                                <p><Pill class="inline mr-2" size={16}/>Obat: {selectedPasien()?.obat_konsumsi || '-'}</p>
                            </div>
                        </div>

                        {/* Skin Analysis Section */}
                        <div class="bg-white p-6 rounded-lg shadow">
                            <h3 class="text-xl font-semibold mb-3 flex items-center"><FileText class="mr-2" /> Riwayat Analisis Kulit</h3>
                            <div class="space-y-4 max-h-60 overflow-y-auto pr-2">
                                <For each={selectedPasien()?.skin_analyses} fallback={<p class="text-gray-500">Belum ada riwayat.</p>}>
                                    {(analysis) => (
                                        <div class="bg-gray-50 p-3 rounded-md border">
                                            <p class="font-bold">Tanggal: {dayjs(analysis.tanggal_analisis).format('DD MMMM YYYY')}</p>
                                            <p><strong>Visual:</strong> {analysis.hasil_visual}</p>
                                            <p><strong>Alat:</strong> {analysis.hasil_alat}</p>
                                        </div>
                                    )}
                                </For>
                            </div>
                            {/* Add New Analysis Form */}
                            <div class="mt-4 pt-4 border-t">
                                <h4 class="font-semibold mb-2">Tambah Analisis Baru</h4>
                                <form onSubmit={handleAddSkinAnalysis}>
                                    <select 
                                        aria-label="Pilih Appointment Analisis" 
                                        class="w-full p-2 border rounded mb-2" 
                                        onChange={(e) => setAnalysisFormData(p => ({...p, appointment_id: e.currentTarget.value}))}
                                        value={analysisFormData().appointment_id}
                                    >
                                        <option value="">Pilih Appointment</option>
                                        <For each={patientAppointments().filter(a => a.is_initial_skin_analysis)}>
                                            {app => <option value={app.id}>Appointment {dayjs(app.tanggal).format('DD/MM/YYYY')}</option>}
                                        </For>
                                    </select>
                                    <input 
                                        type="text" 
                                        placeholder="Hasil Visual..." 
                                        class="w-full p-2 border rounded mb-2" 
                                        onInput={(e) => setAnalysisFormData(p => ({...p, hasil_visual: e.currentTarget.value}))} 
                                        value={analysisFormData().hasil_visual ?? ""}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Hasil Alat..." 
                                        class="w-full p-2 border rounded mb-2" 
                                        onInput={(e) => setAnalysisFormData(p => ({...p, hasil_alat: e.currentTarget.value}))} 
                                        value={analysisFormData().hasil_alat ?? ""}
                                    />
                                    <textarea 
                                        placeholder="Catatan Tambahan..." 
                                        class="w-full p-2 border rounded mb-2" 
                                        onInput={(e) => setAnalysisFormData(p => ({...p, catatan_tambahan: e.currentTarget.value}))}
                                        value={analysisFormData().catatan_tambahan ?? ""}
                                    ></textarea>
                                    <button type="submit" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700" disabled={loading()}>
                                        {loading() ? 'Menyimpan...' : 'Simpan Analisis'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Treatment Progress Section */}
                        <div class="bg-white p-6 rounded-lg shadow">
                            <h3 class="text-xl font-semibold mb-3 flex items-center"><Activity class="mr-2" /> Riwayat Progress Treatment</h3>
                            <div class="space-y-4 max-h-60 overflow-y-auto pr-2">
                                <For each={selectedPasien()?.treatment_progresses} fallback={<p class="text-gray-500">Belum ada riwayat.</p>}>
                                    {(progress) => (
                                        <div class="bg-gray-50 p-3 rounded-md border">
                                            <p class="font-bold">Tanggal: {dayjs(progress.tanggal_progress).format('DD MMMM YYYY')}</p>
                                            <p>{progress.catatan}</p>
                                        </div>
                                    )}
                                </For>
                            </div>
                            {/* Add New Progress Form */}
                            <div class="mt-4 pt-4 border-t">
                                <h4 class="font-semibold mb-2">Tambah Progress Baru</h4>
                                <form onSubmit={handleAddTreatmentProgress}>
                                    <select 
                                        aria-label="Pilih Appointment Progress" 
                                        class="w-full p-2 border rounded mb-2" 
                                        onChange={(e) => setProgressFormData(p => ({...p, appointment_id: e.currentTarget.value}))}
                                        value={progressFormData().appointment_id}
                                    >
                                        <option value="">Pilih Appointment</option>
                                        <For each={patientAppointments()}>
                                            {app => <option value={app.id}>Appointment {dayjs(app.tanggal).format('DD/MM/YYYY')}</option>}
                                        </For>
                                    </select>
                                    <textarea 
                                        placeholder="Catatan progress treatment..." 
                                        class="w-full p-2 border rounded mb-2" 
                                        onInput={(e) => setProgressFormData(p => ({...p, catatan: e.currentTarget.value}))}
                                        value={progressFormData().catatan ?? ""}
                                    ></textarea>
                                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={loading()}>
                                        {loading() ? 'Menyimpan...' : 'Simpan Progress'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
};

export default PasienDataPage;