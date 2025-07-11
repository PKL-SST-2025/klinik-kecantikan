import { Component, createSignal, createMemo, onMount, createEffect, For } from 'solid-js'; // Import 'For' for looping
import AgGridSolid from 'solid-ag-grid';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import '../styles/ag-custom-purple.css'; // Import custom styles for AG Grid
import { Plus, Edit, Trash2, User, Briefcase, CalendarDays } from 'lucide-solid';
import toast, { Toaster } from 'solid-toast';
import { Dokter, DailySchedule } from '../types/database'; // Adjusted import - removed Treatment

const StaffPage: Component = () => {
  // State management
  const [dokterList, setDokterList] = createSignal<Dokter[]>([]);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editingDokter, setEditingDokter] = createSignal<Dokter | null>(null);
  const [gridApi, setGridApi] = createSignal<GridApi | null>(null);
  const [isDataLoaded, setIsDataLoaded] = createSignal(false);

  // Form state - removed spesialisasi
  const [formData, setFormData] = createSignal({
    nama: '',
    posisi: '',
    jadwal: [] as DailySchedule[] // Initialize as empty array of DailySchedule
  });

  // Load data from localStorage on mount
  onMount(() => {
    console.log('onMount: Initializing Dokter data...');
    const storedDokter = localStorage.getItem('dokterList');

    if (storedDokter) {
      const parsedDokter = JSON.parse(storedDokter);
      setDokterList(parsedDokter);
      console.log('onMount: Dokter loaded from localStorage:', parsedDokter);
    } else {
      const sampleDokter: Dokter[] = [ // Sample data without spesialisasi
        {
          id: 1,
          nama: 'Dr. Ayu Lestari',
          posisi: 'Dokter Umum',
          jadwal: [
            { day: 'Senin', startTime: '09:00', endTime: '17:00' },
            { day: 'Rabu', startTime: '09:00', endTime: '17:00' },
            { day: 'Jumat', startTime: '09:00', endTime: '17:00' },
          ]
        },
        {
          id: 2,
          nama: 'Dr. Budi Santoso',
          posisi: 'Dokter Kulit',
          jadwal: [
            { day: 'Selasa', startTime: '10:00', endTime: '18:00' },
            { day: 'Kamis', startTime: '10:00', endTime: '18:00' },
          ]
        },
      ];
      setDokterList(sampleDokter);
      console.log('onMount: Dokter (sample data):', sampleDokter);
    }

    setIsDataLoaded(true);
    console.log('onMount: Dokter data loading complete, isDataLoaded set to true.');
  });

  // Effect to save dokter data to localStorage whenever dokterList changes
  createEffect(() => {
    console.log('createEffect (localStorage): Saving Dokter data to localStorage...');
    localStorage.setItem('dokterList', JSON.stringify(dokterList()));
  });

  // Effect to size columns when gridApi is available
  createEffect(() => {
    console.log('createEffect (gridApi): Checking gridApi for sizeColumnsToFit...');
    const api = gridApi();
    if (api) {
      console.log('createEffect (gridApi): gridApi available, calling sizeColumnsToFit()...');
      setTimeout(() => api.sizeColumnsToFit(), 0);
    } else {
      console.log('createEffect (gridApi): gridApi not yet available.');
    }
  });

  // Helper to format structured schedule for display in AG-Grid
  const formatJadwal = (jadwal: DailySchedule[]) => {
    if (!jadwal || jadwal.length === 0) return '-';
    // Sort by day for consistent display (optional, but good for readability)
    const sortedJadwal = [...jadwal].sort((a, b) => {
      const daysOrder = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    });
    return sortedJadwal.map(s => `${s.day} (${s.startTime}-${s.endTime})`).join('; ');
  };

  const handleActionClick = (action: string, id: number) => {
    if (action === 'edit') {
      handleEdit(id);
    } else if (action === 'delete') {
      handleDelete(id);
    }
  };

  // AG-Grid column definitions for Dokter - removed spesialisasi column
  const dokterColumns = createMemo((): ColDef[] => {
    console.log('createMemo: Dokter Columns re-calculated.');
    return [
      { field: 'id', headerName: 'ID', width: 80, sortable: true },
      { field: 'nama', headerName: 'Nama Dokter', flex: 1, sortable: true },
      { field: 'posisi', headerName: 'Posisi', width: 150, sortable: true },
      {
        field: 'jadwal',
        headerName: 'Jadwal',
        flex: 1.5,
        sortable: true,
        valueFormatter: (params: any) => formatJadwal(params.value)
      },
      {
        headerName: 'Aksi',
        width: 120,
        cellRenderer: (params: any) => {
          return (
            <div class="flex gap-2">
              <button
                class="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                onClick={() => handleActionClick('edit', params.data.id)}
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                class="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                onClick={() => handleActionClick('delete', params.data.id)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        }
      }
    ];
  });

  const onGridReady = (params: GridReadyEvent) => {
    console.log('onGridReady: Dokter Grid API is ready.');
    setGridApi(params.api);
    params.api.sizeColumnsToFit(); // Initial column sizing
  };

  // Handler for editing a dokter
  const handleEdit = (id: number) => {
    console.log('handleEdit: Attempting to edit dokter with ID:', id);
    const dokter = dokterList().find(d => d.id === id);
    if (dokter) {
      setEditingDokter(dokter);
      setFormData({
        nama: dokter.nama,
        posisi: dokter.posisi,
        jadwal: [...dokter.jadwal] // Create a copy to prevent direct mutation
      });
      setIsModalOpen(true);
      console.log('handleEdit: Opened modal for editing Dokter.');
    }
  };

  // Handler for deleting a dokter
  const handleDelete = (id: number) => {
    console.log('handleDelete: Attempting to delete dokter with ID:', id);
    setDokterList(prev => prev.filter(d => d.id !== id));
    toast.success('Dokter berhasil dihapus');
    console.log('Dokter deleted:', id);
  };

  // Handler for form submission (Add/Edit) - removed spesialisasi validation
  const handleSubmit = (e: Event) => {
    e.preventDefault();

    // Validasi jadwal
    if (formData().jadwal.some(s => !s.day || !s.startTime || !s.endTime)) {
      toast.error('Pastikan semua detail jadwal terisi (Hari, Jam Mulai, Jam Selesai).');
      return;
    }

    const newDokter: Dokter = {
      id: editingDokter() ? editingDokter()!.id : Date.now(),
      nama: formData().nama,
      posisi: formData().posisi,
      jadwal: formData().jadwal,
    };

    if (editingDokter()) {
      setDokterList(prev => prev.map(d => d.id === newDokter.id ? newDokter : d));
      toast.success('Dokter berhasil diupdate');
      console.log('Dokter updated:', newDokter);
    } else {
      setDokterList(prev => [...prev, newDokter]);
      toast.success('Dokter berhasil ditambahkan');
      console.log('Dokter added:', newDokter);
    }

    closeModal();
  };

  // Close modal handler
  const closeModal = () => {
    console.log('closeModal: Closing modal.');
    setIsModalOpen(false);
    setEditingDokter(null);
    // Reset form data to initial empty states, including jadwal as an empty array
    setFormData({ nama: '', posisi: '', jadwal: [] });
  };

  // Open add modal handler
  const openAddModal = () => {
    console.log('openAddModal: Opening add modal.');
    setEditingDokter(null); // Ensure no item is being edited when adding
    // Clear form and initialize jadwal as an empty array
    setFormData({ nama: '', posisi: '', jadwal: [] });
    setIsModalOpen(true);
  };

  // Memoized rowData for AgGridSolid
  const rowDataToDisplay = createMemo(() => {
    const data = dokterList();
    console.log('Memoized rowDataToDisplay for Dokter is:', data);
    return data;
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 font-sans">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Manajemen Dokter</h1>
        <p class="text-gray-600">Kelola informasi dokter dan jadwal mereka di klinik</p>
      </div>

      {/* Main Content Card (Table and Add Button) */}
      <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8">
        {/* Header with Add Button */}
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900">Daftar Dokter</h2>
            <p class="text-gray-600 mt-1">Total: {dokterList().length} dokter</p>
          </div>
          <button
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors duration-200 shadow-md hover:shadow-lg"
            onClick={openAddModal}
          >
            <Plus size={16} />
            Tambah Dokter
          </button>
        </div>

        {/* AG-Grid Table */}
        <div class="ag-theme-alpine rounded-xl overflow-hidden border border-gray-200" style={{ height: '500px', width: '100%' }}>
          {isDataLoaded() ? (
            <>
              {console.log('Rendering AgGridSolid for Dokter. Props:', {
                columnDefs: dokterColumns(),
                rowData: rowDataToDisplay(),
              })}
              <AgGridSolid
                columnDefs={dokterColumns()}
                rowData={rowDataToDisplay()}
                onGridReady={onGridReady}
                defaultColDef={{
                  resizable: true,
                  sortable: true,
                  filter: true,
                  flex: 1,
                  minWidth: 100
                }}
                pagination={true}
                paginationPageSize={10}
                domLayout="autoHeight"
                animateRows={true}
              />
            </>
          ) : (
            <div class="flex justify-center items-center h-full text-gray-500">
              Memuat data tabel...
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen() && (
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">
                {editingDokter() ? 'Edit Dokter' : 'Tambah Dokter'}
              </h3>

              <form onSubmit={handleSubmit} class="space-y-4">
                {/* Nama Dokter Field */}
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <div class="flex items-center gap-2">
                      <User size={16} />
                      Nama Dokter
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData().nama}
                    onInput={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Jabatan/Posisi Field */}
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <div class="flex items-center gap-2">
                      <Briefcase size={16} />
                      Jabatan/Posisi
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData().posisi}
                    onInput={(e) => setFormData(prev => ({ ...prev, posisi: e.target.value }))}
                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Jadwal Dokter Field */}
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <div class="flex items-center gap-2">
                      <CalendarDays size={16} />
                      Jadwal Dokter
                    </div>
                  </label>
                  {/* Loop through each daily schedule entry */}
                  <For each={formData().jadwal}>
                    {(schedule, index) => (
                      <div class="flex flex-wrap items-center gap-2 mb-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                        <select
                          value={schedule.day}
                          onInput={(e) => {
                            const updatedJadwal = [...formData().jadwal];
                            updatedJadwal[index()].day = e.target.value as DailySchedule['day'];
                            setFormData(prev => ({ ...prev, jadwal: updatedJadwal }));
                          }}
                          class="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400 w-24"
                          required
                        >
                          <option value="">Pilih Hari</option>
                          <option value="Senin">Senin</option>
                          <option value="Selasa">Selasa</option>
                          <option value="Rabu">Rabu</option>
                          <option value="Kamis">Kamis</option>
                          <option value="Jumat">Jumat</option>
                          <option value="Sabtu">Sabtu</option>
                          <option value="Minggu">Minggu</option>
                        </select>
                        <input
                          type="time"
                          value={schedule.startTime}
                          onInput={(e) => {
                            const updatedJadwal = [...formData().jadwal];
                            updatedJadwal[index()].startTime = e.target.value;
                            setFormData(prev => ({ ...prev, jadwal: updatedJadwal }));
                          }}
                          class="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400 w-24"
                          required
                        />
                        <span class="text-gray-600">-</span>
                        <input
                          type="time"
                          value={schedule.endTime}
                          onInput={(e) => {
                            const updatedJadwal = [...formData().jadwal];
                            updatedJadwal[index()].endTime = e.target.value;
                            setFormData(prev => ({ ...prev, jadwal: updatedJadwal }));
                          }}
                          class="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400 w-24"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              jadwal: prev.jadwal.filter((_, i) => i !== index())
                            }));
                          }}
                          class="text-red-600 hover:text-red-800 p-1 rounded-full transition-colors"
                          title="Hapus Jadwal Ini"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </For>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        // Add a new empty schedule entry with default values
                        jadwal: [...prev.jadwal, { day: 'Senin', startTime: '09:00', endTime: '17:00' }]
                      }));
                    }}
                    class="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-colors duration-200 shadow-md"
                  >
                    <Plus size={16} /> Tambah Hari & Jam
                  </button>
                  <p class="text-xs text-gray-500 mt-1">Tambahkan setiap hari kerja dokter beserta jam mulai dan selesai.</p>
                </div>

                {/* Action Buttons */}
                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    {editingDokter() ? 'Update' : 'Tambah'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;