// src/pages/pasien.tsx
import { createSignal, For, Show, onMount, Component, createMemo } from 'solid-js';
import { Pasien, SkinAnalysis, TreatmentProgress, Appointment, Treatment, Produk } from '../types/database';
import { User, FileText, Stethoscope, Activity, Heart, Shield, Pill } from 'lucide-solid';
import toast, { Toaster } from 'solid-toast';
import dayjs from 'dayjs';

const PasienDataPage: Component = () => {
    // --- State ---
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<Treatment[]>([]);
    const [productList, setProductList] = createSignal<Produk[]>([]);
    const [selectedPasien, setSelectedPasien] = createSignal<Pasien | null>(null);

    // --- Form State ---
    const [analysisFormData, setAnalysisFormData] = createSignal({
        appointmentId: 0,
        hasilVisual: '',
        hasilAlat: '',
        rekomendasiTreatment: [] as number[],
        rekomendasiProduk: [] as number[],
        catatanTambahan: '',
    });

    const [progressFormData, setProgressFormData] = createSignal({
        appointmentId: 0,
        catatan: '',
    });

    // --- Data Loading ---
    onMount(() => {
        const storedPasien = localStorage.getItem('pasienList');
        if (storedPasien) setPasienList(JSON.parse(storedPasien));

        const storedAppointments = localStorage.getItem('appointmentList');
        if (storedAppointments) setAppointmentList(JSON.parse(storedAppointments));

        const storedTreatments = localStorage.getItem('treatmentList');
        if (storedTreatments) setTreatmentList(JSON.parse(storedTreatments));
        
        const storedProduk = localStorage.getItem('produkList'); // Assuming you save products here
        if (storedProduk) setProductList(JSON.parse(storedProduk));
    });

    const patientAppointments = createMemo(() => {
        if (!selectedPasien()) return [];
        return appointmentList().filter(app => app.pasienId === selectedPasien()!.id);
    });

    // --- Handlers ---
    const handleSelectPasien = (pasien: Pasien) => {
        setSelectedPasien(pasien);
        // Reset forms
        setAnalysisFormData({ appointmentId: 0, hasilVisual: '', hasilAlat: '', rekomendasiTreatment: [], rekomendasiProduk: [], catatanTambahan: '' });
        setProgressFormData({ appointmentId: 0, catatan: '' });
    };
    
    const handleAddSkinAnalysis = () => {
        const { appointmentId, hasilVisual, hasilAlat } = analysisFormData();
        if (!appointmentId || !hasilVisual || !hasilAlat) {
            toast.error("Appointment, Hasil Visual, dan Hasil Alat wajib diisi.");
            return;
        }

        const newAnalysis: SkinAnalysis = {
            id: Date.now(),
            tanggalAnalisis: dayjs().format('YYYY-MM-DD'),
            ...analysisFormData(),
        };

        const updatedPasienList = pasienList().map(p => {
            if (p.id === selectedPasien()!.id) {
                const updatedAnalyses = [...p.skinAnalyses, newAnalysis];
                return { ...p, skinAnalyses: updatedAnalyses };
            }
            return p;
        });

        setPasienList(updatedPasienList);
        localStorage.setItem('pasienList', JSON.stringify(updatedPasienList));
        setSelectedPasien(prev => prev ? { ...prev, skinAnalyses: [...prev.skinAnalyses, newAnalysis] } : null);
        toast.success("Hasil Analisis Kulit berhasil ditambahkan!");
    };
    
    const handleAddTreatmentProgress = () => {
        const { appointmentId, catatan } = progressFormData();
        if (!appointmentId || !catatan) {
            toast.error("Appointment dan Catatan Progress wajib diisi.");
            return;
        }

        const newProgress: TreatmentProgress = {
            id: Date.now(),
            tanggalProgress: dayjs().format('YYYY-MM-DD'),
            ...progressFormData(),
        };

        const updatedPasienList = pasienList().map(p => {
            if (p.id === selectedPasien()!.id) {
                const updatedProgresses = [...p.treatmentProgresses, newProgress];
                return { ...p, treatmentProgresses: updatedProgresses };
            }
            return p;
        });

        setPasienList(updatedPasienList);
        localStorage.setItem('pasienList', JSON.stringify(updatedPasienList));
        setSelectedPasien(prev => prev ? { ...prev, treatmentProgresses: [...prev.treatmentProgresses, newProgress] } : null);
        toast.success("Progress Treatment berhasil ditambahkan!");
    };


    return (
        <div class="p-8 bg-gray-50">
            <Toaster position="top-center" />
            <h1 class="text-3xl font-bold mb-6 text-gray-800">Manajemen Data Pasien</h1>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Patient List */}
                <div class="md:col-span-1 bg-white p-4 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-4">Daftar Pasien</h2>
                    <ul class="space-y-2 max-h-[70vh] overflow-y-auto">
                        <For each={pasienList()}>
                            {(pasien) => (
                                <li
                                    class={`p-3 rounded-md cursor-pointer transition-all ${selectedPasien()?.id === pasien.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-purple-100'}`}
                                    onClick={() => handleSelectPasien(pasien)}
                                >
                                    <div class="font-bold">{pasien.namaLengkap}</div>
                                    <div class="text-sm">{pasien.noTelepon}</div>
                                </li>
                            )}
                        </For>
                    </ul>
                </div>

                {/* Patient Details */}
                <div class="md:col-span-3 space-y-6">
                    <Show when={selectedPasien()} fallback={<div class="bg-white p-10 rounded-lg shadow text-center text-gray-500">Pilih pasien untuk melihat detail.</div>}>
                        <div class="bg-white p-6 rounded-lg shadow">
                             <h2 class="text-2xl font-bold mb-4 text-gray-800">{selectedPasien()?.namaLengkap}</h2>
                             {/* Basic Info */}
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                <p><User class="inline mr-2" size={16}/>{selectedPasien()?.email}</p>
                                <p><Heart class="inline mr-2" size={16}/>{dayjs(selectedPasien()?.tanggalLahir).format('DD MMMM YYYY')} ({selectedPasien()?.jenisKelamin})</p>
                                <p><Shield class="inline mr-2" size={16}/>Alergi: {selectedPasien()?.riwayatAlergi || '-'}</p>
                                <p><Pill class="inline mr-2" size={16}/>Obat: {selectedPasien()?.obatKonsumsi || '-'}</p>
                             </div>
                        </div>

                         {/* Skin Analysis Section */}
                        <div class="bg-white p-6 rounded-lg shadow">
                            <h3 class="text-xl font-semibold mb-3 flex items-center"><FileText class="mr-2" /> Riwayat Analisis Kulit</h3>
                            <div class="space-y-4 max-h-60 overflow-y-auto pr-2">
                                <For each={selectedPasien()?.skinAnalyses} fallback={<p class="text-gray-500">Belum ada riwayat.</p>}>
                                    {(analysis) => (
                                        <div class="bg-gray-50 p-3 rounded-md border">
                                            <p class="font-bold">Tanggal: {dayjs(analysis.tanggalAnalisis).format('DD MMMM YYYY')}</p>
                                            <p><strong>Visual:</strong> {analysis.hasilVisual}</p>
                                            <p><strong>Alat:</strong> {analysis.hasilAlat}</p>
                                        </div>
                                    )}
                                </For>
                            </div>
                             {/* Add New Analysis Form */}
                            <div class="mt-4 pt-4 border-t">
                                <h4 class="font-semibold mb-2">Tambah Analisis Baru</h4>
                                <select class="w-full p-2 border rounded mb-2" onChange={(e) => setAnalysisFormData(p => ({...p, appointmentId: +e.currentTarget.value}))}>
                                    <option value={0}>Pilih Appointment</option>
                                    <For each={patientAppointments().filter(a => a.isInitialSkinAnalysis)}>
                                        {app => <option value={app.id}>Appointment {dayjs(app.tanggal).format('DD/MM/YYYY')}</option>}
                                    </For>
                                </select>
                                <input type="text" placeholder="Hasil Visual..." class="w-full p-2 border rounded mb-2" onInput={(e) => setAnalysisFormData(p => ({...p, hasilVisual: e.currentTarget.value}))} />
                                <input type="text" placeholder="Hasil Alat..." class="w-full p-2 border rounded mb-2" onInput={(e) => setAnalysisFormData(p => ({...p, hasilAlat: e.currentTarget.value}))} />
                                <textarea placeholder="Catatan Tambahan..." class="w-full p-2 border rounded mb-2" onInput={(e) => setAnalysisFormData(p => ({...p, catatanTambahan: e.currentTarget.value}))}></textarea>
                                <button onClick={handleAddSkinAnalysis} class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Simpan Analisis</button>
                            </div>
                        </div>

                        {/* Treatment Progress Section */}
                        <div class="bg-white p-6 rounded-lg shadow">
                             <h3 class="text-xl font-semibold mb-3 flex items-center"><Activity class="mr-2" /> Riwayat Progress Treatment</h3>
                             <div class="space-y-4 max-h-60 overflow-y-auto pr-2">
                                <For each={selectedPasien()?.treatmentProgresses} fallback={<p class="text-gray-500">Belum ada riwayat.</p>}>
                                    {(progress) => (
                                        <div class="bg-gray-50 p-3 rounded-md border">
                                            <p class="font-bold">Tanggal: {dayjs(progress.tanggalProgress).format('DD MMMM YYYY')}</p>
                                            <p>{progress.catatan}</p>
                                        </div>
                                    )}
                                </For>
                             </div>
                              {/* Add New Progress Form */}
                             <div class="mt-4 pt-4 border-t">
                                <h4 class="font-semibold mb-2">Tambah Progress Baru</h4>
                                <select class="w-full p-2 border rounded mb-2" onChange={(e) => setProgressFormData(p => ({...p, appointmentId: +e.currentTarget.value}))}>
                                    <option value={0}>Pilih Appointment</option>
                                    <For each={patientAppointments()}>
                                        {app => <option value={app.id}>Appointment {dayjs(app.tanggal).format('DD/MM/YYYY')}</option>}
                                    </For>
                                </select>
                                <textarea placeholder="Catatan progress treatment..." class="w-full p-2 border rounded mb-2" onInput={(e) => setProgressFormData(p => ({...p, catatan: e.currentTarget.value}))}></textarea>
                                <button onClick={handleAddTreatmentProgress} class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan Progress</button>
                            </div>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
};

export default PasienDataPage;