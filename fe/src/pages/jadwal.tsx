import { Component, createSignal, onMount, For, Show, createMemo } from 'solid-js';
import toast, { Toaster } from 'solid-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/id'; // Import locale for Indonesian dates
import isBetween from 'dayjs/plugin/isBetween'; // Make sure this plugin is extended if used for date ranges
import { Calendar, User, Stethoscope, Tag, Clock, CheckCircle, XCircle, Filter, Search } from 'lucide-solid';

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);
dayjs.locale('id'); // Set locale globally

// Import interfaces (pastikan path-nya benar sesuai struktur project Anda)
import { Appointment, Pasien, Dokter, Treatment } from '../types/database';

const AppointmentSchedulePage: Component = () => {
    const [appointmentList, setAppointmentList] = createSignal<Appointment[]>([]);
    const [pasienList, setPasienList] = createSignal<Pasien[]>([]);
    const [dokterList, setDokterList] = createSignal<Dokter[]>([]);
    const [treatmentList, setTreatmentList] = createSignal<Treatment[]>([]);

    const [filterDate, setFilterDate] = createSignal<string>(''); // YYYY-MM-DD
    const [filterDokterId, setFilterDokterId] = createSignal<number | 'all'>('all');
    const [filterStatus, setFilterStatus] = createSignal<string | 'all'>('all');
    const [searchTerm, setSearchTerm] = createSignal<string>('');

    // --- OnMount: Load data from localStorage ---
    onMount(() => {
        const storedAppointment = localStorage.getItem('appointmentList');
        const storedPasien = localStorage.getItem('pasienList');
        const storedDokter = localStorage.getItem('dokterList');
        const storedTreatment = localStorage.getItem('treatmentList');

        if (storedAppointment) setAppointmentList(JSON.parse(storedAppointment));
        if (storedPasien) setPasienList(JSON.parse(storedPasien));
        if (storedDokter) setDokterList(JSON.parse(storedDokter));
        if (storedTreatment) setTreatmentList(JSON.parse(storedTreatment));
    });

    // --- Helper Functions for Data Display ---
    const getPasienName = (id: number) => pasienList().find(p => p.id === id)?.namaLengkap || 'Pasien Tidak Ditemukan';
    const getDokterName = (id: number) => dokterList().find(d => d.id === id)?.nama || 'Dokter Tidak Ditemukan';
    const getTreatmentNames = (ids: number[]) => {
        return ids.map(id => treatmentList().find(t => t.id === id)?.nama || 'N/A').join(', ');
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'booked': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // --- Filtered Appointments ---
    const filteredAppointments = createMemo(() => {
        let filtered = appointmentList();

        // Filter by Date
        if (filterDate()) {
            filtered = filtered.filter(appt => appt.tanggal === filterDate());
        }

        // Filter by Dokter
        if (filterDokterId() !== 'all') {
            filtered = filtered.filter(appt => appt.dokterId === filterDokterId());
        }

        // Filter by Status
        if (filterStatus() !== 'all') {
            filtered = filtered.filter(appt => appt.status === filterStatus());
        }

        // Filter by Search Term (Pasien Name, Dokter Name, Treatment Name)
        if (searchTerm()) {
            const lowerCaseSearch = searchTerm().toLowerCase();
            filtered = filtered.filter(appt => {
                const pasienName = getPasienName(appt.pasienId).toLowerCase();
                const dokterName = getDokterName(appt.dokterId).toLowerCase();
                const treatmentNames = getTreatmentNames(appt.treatmentIds).toLowerCase();
                return pasienName.includes(lowerCaseSearch) ||
                       dokterName.includes(lowerCaseSearch) ||
                       treatmentNames.includes(lowerCaseSearch);
            });
        }

        // Sort by Date only (earliest first)
        return filtered.sort((a, b) => {
            const dateA = dayjs(a.tanggal);
            const dateB = dayjs(b.tanggal);
            return dateA.diff(dateB);
        });
    });

    // --- Handlers ---
    const handleCancelAppointment = (appointmentId: number) => {
        toast.promise(
            new Promise<string>((resolve, reject) => {
                setTimeout(() => { // Simulate API call
                    setAppointmentList(prev => prev.map(appt =>
                        appt.id === appointmentId ? { ...appt, status: 'cancelled' } : appt
                    ));
                    localStorage.setItem('appointmentList', JSON.stringify(appointmentList())); // Save to localStorage
                    resolve('Appointment berhasil dibatalkan!');
                }, 500);
            }),
            {
                loading: 'Membatalkan appointment...',
                success: (message: string) => message,
                error: 'Gagal membatalkan appointment.',
            }
        );
    };

    return (
        <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-6 font-sans">
            <Toaster position="top-right" />

            {/* Header Section */}
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Jadwal Appointment Klinik</h1>
                <p class="text-gray-600">Lihat dan kelola semua jadwal appointment pasien.</p>
            </div>

            {/* Filter and Search Section */}
            <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-4 items-end">
                <div class="flex-1 w-full">
                    <label for="search-term" class="block text-sm font-medium text-gray-700 mb-1">Cari Pasien/Dokter/Treatment</label>
                    <div class="relative">
                        <input
                            type="text"
                            id="search-term"
                            class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Cari..."
                            value={searchTerm()}
                            onInput={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div class="w-full md:w-auto">
                    <label for="filter-date" class="block text-sm font-medium text-gray-700 mb-1">Filter Tanggal</label>
                    <input
                        type="date"
                        id="filter-date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={filterDate()}
                        onInput={(e) => setFilterDate(e.target.value)}
                    />
                </div>

                <div class="w-full md:w-auto">
                    <label for="filter-dokter" class="block text-sm font-medium text-gray-700 mb-1">Filter Dokter</label>
                    <select
                        id="filter-dokter"
                        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={filterDokterId()}
                        onInput={(e) => setFilterDokterId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    >
                        <option value="all">Semua Dokter</option>
                        <For each={dokterList()}>
                            {(dokter) => <option value={dokter.id}>{dokter.nama}</option>}
                        </For>
                    </select>
                </div>

                <div class="w-full md:w-auto">
                    <label for="filter-status" class="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
                    <select
                        id="filter-status"
                        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={filterStatus()}
                        onInput={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Semua Status</option>
                        <option value="booked">Booked</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                    </select>
                </div>

                <button
                    onClick={() => {
                        setFilterDate('');
                        setFilterDokterId('all');
                        setFilterStatus('all');
                        setSearchTerm('');
                    }}
                    class="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm"
                >
                    <Filter size={18} /> Reset Filter
                </button>
            </div>

            {/* Appointment List Table */}
            <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar size={24} /> Daftar Appointment
                </h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead class="bg-purple-100 text-purple-800">
                            <tr>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Tanggal</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Pasien</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Dokter</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Treatment</th>
                                <th class="py-3 px-4 text-left text-sm font-semibold">Status</th>
                                <th class="py-3 px-4 text-center text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show when={filteredAppointments().length > 0} fallback={
                                <tr><td colSpan={6} class="text-center py-4 text-gray-500">Tidak ada appointment yang sesuai filter.</td></tr>
                            }>
                                <For each={filteredAppointments()}>
                                    {(appt) => (
                                        <tr class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                            <td class="py-3 px-4 text-gray-800">
                                                <p>{dayjs(appt.tanggal).format('DD MMMM YYYY')}</p>
                                            </td>
                                            <td class="py-3 px-4 text-gray-800">{getPasienName(appt.pasienId)}</td>
                                            <td class="py-3 px-4 text-gray-800">{getDokterName(appt.dokterId)}</td>
                                            <td class="py-3 px-4 text-gray-800">{getTreatmentNames(appt.treatmentIds)}</td>
                                            <td class="py-3 px-4">
                                                <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(appt.status)}`}>
                                                    {appt.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td class="py-3 px-4 text-center">
                                                <Show when={appt.status === 'booked'}>
                                                    <button
                                                        onClick={() => handleCancelAppointment(appt.id)}
                                                        class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-all duration-200 flex items-center justify-center mx-auto"
                                                        title="Batalkan Appointment"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </Show>
                                                <Show when={appt.status !== 'booked'}>
                                                    <span class="text-gray-400 text-sm">No actions</span>
                                                </Show>
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

export default AppointmentSchedulePage;