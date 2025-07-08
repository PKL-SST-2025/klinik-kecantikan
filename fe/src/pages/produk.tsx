import { Component, createSignal, createMemo, onMount, createEffect } from 'solid-js';
import AgGridSolid from 'solid-ag-grid';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Plus, Edit, Trash2, Package, Clock, DollarSign, Hash } from 'lucide-solid';
import toast, { Toaster } from 'solid-toast';

// Types (tetap sama)
interface Produk {
  id: number;
  nama: string;
  stok: number;
  harga: number;
}

interface Treatment {
  id: number;
  nama: string;
  estimasiWaktu: number; // dalam menit
  harga: number;
}

type TabType = 'produk' | 'treatment';

const ProdukTreatmentPage: Component = () => {
  // State management
  const [activeTab, setActiveTab] = createSignal<TabType>('produk');
  const [produkList, setProdukList] = createSignal<Produk[]>([]);
  const [treatmentList, setTreatmentList] = createSignal<Treatment[]>([]);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editingItem, setEditingItem] = createSignal<Produk | Treatment | null>(null);
  const [gridApi, setGridApi] = createSignal<GridApi | null>(null);
  // NEW SIGNAL: Menandakan apakah data awal sudah dimuat
  const [isDataLoaded, setIsDataLoaded] = createSignal(false);

  // Form state (tetap sama)
  const [formData, setFormData] = createSignal({
    nama: '',
    stok: 0,
    harga: 0,
    estimasiWaktu: 0
  });

  // Initialize with sample data or data from localStorage
  onMount(() => {
    console.log('onMount: Initializing data...');
    const storedProduk = localStorage.getItem('produkList');
    const storedTreatment = localStorage.getItem('treatmentList');

    if (storedProduk) {
      const parsedProduk = JSON.parse(storedProduk);
      setProdukList(parsedProduk);
      console.log('onMount: Produk loaded from localStorage:', parsedProduk);
    } else {
      const sampleProduk = [
        { id: 1, nama: 'Serum Vitamin C', stok: 25, harga: 150000 },
        { id: 2, nama: 'Moisturizer Anti-Aging', stok: 18, harga: 280000 },
        { id: 3, nama: 'Sunscreen SPF 50', stok: 32, harga: 120000 },
      ];
      setProdukList(sampleProduk);
      console.log('onMount: Produk (sample data):', sampleProduk);
    }

    if (storedTreatment) {
      const parsedTreatment = JSON.parse(storedTreatment);
      setTreatmentList(parsedTreatment);
      console.log('onMount: Treatment loaded from localStorage:', parsedTreatment);
    } else {
      const sampleTreatment = [
        { id: 1, nama: 'Facial Hydrating', estimasiWaktu: 60, harga: 200000 },
        { id: 2, nama: 'Chemical Peeling', estimasiWaktu: 90, harga: 350000 },
        { id: 3, nama: 'Microneedling', estimasiWaktu: 75, harga: 450000 },
      ];
      setTreatmentList(sampleTreatment);
      console.log('onMount: Treatment (sample data):', sampleTreatment);
    }

    // NEW: Set isDataLoaded to true AFTER all initial data is set
    setIsDataLoaded(true);
    console.log('onMount: Data loading complete, isDataLoaded set to true.');
  });

  // Effect to save data to localStorage whenever lists change (tetap sama)
  createEffect(() => {
    console.log('createEffect (localStorage): Saving data to localStorage...');
    localStorage.setItem('produkList', JSON.stringify(produkList()));
    localStorage.setItem('treatmentList', JSON.stringify(treatmentList()));
  });

  // Effect to size columns when gridApi is available or tab changes (tetap sama)
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

  // ... (handleActionClick, produkColumns, treatmentColumns tetap sama) ...
  const handleActionClick = (action: string, id: number) => {
    if (action === 'edit') {
      handleEdit(id);
    } else if (action === 'delete') {
      handleDelete(id);
    }
  };

  // AG-Grid column definitions for Produk
  const produkColumns = createMemo((): ColDef[] => {
    console.log('createMemo: Produk Columns re-calculated.');
    return [
      { field: 'id', headerName: 'ID', width: 80, sortable: true },
      { field: 'nama', headerName: 'Nama Produk', flex: 1, sortable: true },
      {
        field: 'stok',
        headerName: 'Stok',
        width: 100,
        sortable: true,
        valueFormatter: (params: any) => `${params.value} pcs`
      },
      {
        field: 'harga',
        headerName: 'Harga',
        width: 130,
        sortable: true,
        valueFormatter: (params: any) => `Rp ${params.value.toLocaleString('id-ID')}`
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

  // AG-Grid column definitions for Treatment
  const treatmentColumns = createMemo((): ColDef[] => {
    console.log('createMemo: Treatment Columns re-calculated.');
    return [
      { field: 'id', headerName: 'ID', width: 80, sortable: true },
      { field: 'nama', headerName: 'Nama Treatment', flex: 1, sortable: true },
      {
        field: 'estimasiWaktu',
        headerName: 'Estimasi Waktu',
        width: 150,
        sortable: true,
        valueFormatter: (params: any) => `${params.value} menit`
      },
      {
        field: 'harga',
        headerName: 'Harga',
        width: 130,
        sortable: true,
        valueFormatter: (params: any) => `Rp ${params.value.toLocaleString('id-ID')}`
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
  // Event handlers (tetap sama, kecuali onGridReady dan handleTabChange jika ada setTimeout)
  const onGridReady = (params: GridReadyEvent) => {
    console.log('onGridReady: Grid API is ready.');
    setGridApi(params.api);
    params.api.sizeColumnsToFit(); // Initial column sizing
  };

  // ... (handleEdit, handleDelete, handleSubmit, closeModal, openAddModal tetap sama) ...
    // Handler for editing an item
  const handleEdit = (id: number) => {
    console.log('handleEdit: Attempting to edit item with ID:', id);
    if (activeTab() === 'produk') {
      const item = produkList().find(p => p.id === id);
      if (item) {
        setEditingItem(item);
        setFormData({
          nama: item.nama,
          stok: item.stok,
          harga: item.harga,
          estimasiWaktu: 0 // Default to 0 for produk, as it's not applicable
        });
        setIsModalOpen(true);
        console.log('handleEdit: Opened modal for editing Produk.');
      }
    } else {
      const item = treatmentList().find(t => t.id === id);
      if (item) {
        setEditingItem(item);
        setFormData({
          nama: item.nama,
          stok: 0, // Default to 0 for treatment, as it's not applicable
          harga: item.harga,
          estimasiWaktu: item.estimasiWaktu
        });
        setIsModalOpen(true);
        console.log('handleEdit: Opened modal for editing Treatment.');
      }
    }
  };

  // Handler for deleting an item
  const handleDelete = (id: number) => {
    console.log('handleDelete: Attempting to delete item with ID:', id);
    if (activeTab() === 'produk') {
      setProdukList(prev => prev.filter(p => p.id !== id));
      toast.success('Produk berhasil dihapus');
      console.log('Produk deleted:', id);
    } else {
      setTreatmentList(prev => prev.filter(t => t.id !== id));
      toast.success('Treatment berhasil dihapus');
      console.log('Treatment deleted:', id);
    }
  };

  // Handler for form submission (Add/Edit)
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('handleSubmit: Submitting form. Active tab:', activeTab(), 'Form Data:', formData());

    if (activeTab() === 'produk') {
      const newProduk: Produk = {
        id: editingItem() ? editingItem()!.id : Date.now(), // Use existing ID or new unique ID
        nama: formData().nama,
        stok: formData().stok,
        harga: formData().harga
      };

      if (editingItem()) {
        setProdukList(prev => prev.map(p => p.id === newProduk.id ? newProduk : p));
        toast.success('Produk berhasil diupdate');
        console.log('Produk updated:', newProduk);
      } else {
        setProdukList(prev => [...prev, newProduk]);
        toast.success('Produk berhasil ditambahkan');
        console.log('Produk added:', newProduk);
      }
    } else {
      const newTreatment: Treatment = {
        id: editingItem() ? editingItem()!.id : Date.now(), // Use existing ID or new unique ID
        nama: formData().nama,
        estimasiWaktu: formData().estimasiWaktu,
        harga: formData().harga
      };

      if (editingItem()) {
        setTreatmentList(prev => prev.map(t => t.id === newTreatment.id ? newTreatment : t));
        toast.success('Treatment berhasil diupdate');
        console.log('Treatment updated:', newTreatment);
      } else {
        setTreatmentList(prev => [...prev, newTreatment]);
        toast.success('Treatment berhasil ditambahkan');
        console.log('Treatment added:', newTreatment);
      }
    }

    closeModal();
  };

  // Close modal handler
  const closeModal = () => {
    console.log('closeModal: Closing modal.');
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ nama: '', stok: 0, harga: 0, estimasiWaktu: 0 }); // Reset form data
  };

  // Open add modal handler
  const openAddModal = () => {
    console.log('openAddModal: Opening add modal.');
    setEditingItem(null); // Ensure no item is being edited when adding
    setFormData({ nama: '', stok: 0, harga: 0, estimasiWaktu: 0 }); // Clear form
    setIsModalOpen(true);
  };

  const handleTabChange = (tab: TabType) => {
    console.log('handleTabChange: Switching tab to:', tab);
    setActiveTab(tab);
    if (gridApi()) {
      setTimeout(() => gridApi()!.sizeColumnsToFit(), 0);
    }
  };

  // Memoized rowData for AgGridSolid
  const rowDataToDisplay = createMemo(() => {
    const data = activeTab() === 'produk' ? produkList() : treatmentList();
    console.log(`Memoized rowDataToDisplay for tab '${activeTab()}' is:`, data);
    return data;
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 font-sans">
      <Toaster position="top-right" />

      {/* ... (Header, Tabs, Content Card header tetap sama) ... */}
        {/* Header Section */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Produk & Treatment</h1>
        <p class="text-gray-600">Kelola produk dan treatment yang tersedia di klinik kecantikan</p>
      </div>

      {/* Tabs Navigation */}
      <div class="mb-6">
        <nav class="flex space-x-8 border-b border-gray-200">
          <button
            class={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab() === 'produk'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-all duration-200 ease-in-out`}
            onClick={() => handleTabChange('produk')}
          >
            <div class="flex items-center gap-2">
              <Package size={16} />
              Produk
            </div>
          </button>
          <button
            class={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab() === 'treatment'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-all duration-200 ease-in-out`}
            onClick={() => handleTabChange('treatment')}
          >
            <div class="flex items-center gap-2">
              <Clock size={16} />
              Treatment
            </div>
          </button>
        </nav>
      </div>
      {/* Main Content Card (Table and Add Button) */}
      <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8">
        {/* Header with Add Button */}
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900">
              {activeTab() === 'produk' ? 'Daftar Produk' : 'Daftar Treatment'}
            </h2>
            <p class="text-gray-600 mt-1">
              {activeTab() === 'produk'
                ? `Total: ${produkList().length} produk`
                : `Total: ${treatmentList().length} treatment`}
            </p>
          </div>
          <button
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors duration-200 shadow-md hover:shadow-lg"
            onClick={openAddModal}
          >
            <Plus size={16} />
            Tambah {activeTab() === 'produk' ? 'Produk' : 'Treatment'}
          </button>
        </div>

        {/* AG-Grid Table */}
        <div class="ag-theme-alpine rounded-xl overflow-hidden border border-gray-200" style={{ height: '500px', width: '100%' }}>
          {/* NEW: Conditional rendering of AgGridSolid */}
          {isDataLoaded() ? (
            <>
              {console.log('Rendering AgGridSolid. Props:', {
                columnDefs: activeTab() === 'produk' ? produkColumns() : treatmentColumns(),
                rowData: rowDataToDisplay(),
                activeTab: activeTab()
              })}
              <AgGridSolid
                columnDefs={activeTab() === 'produk' ? produkColumns() : treatmentColumns()}
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

      {/* ... (Modal for Add/Edit tetap sama) ... */}
          {/* Modal for Add/Edit */}
      {isModalOpen() && (
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          {/* Modal content div. 'animate-scale-in' will handle initial opacity/scale. */}
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">
                {editingItem() ? 'Edit' : 'Tambah'} {activeTab() === 'produk' ? 'Produk' : 'Treatment'}
              </h3>

              <form onSubmit={handleSubmit} class="space-y-4">
                {/* Nama Field */}
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nama {activeTab() === 'produk' ? 'Produk' : 'Treatment'}
                  </label>
                  <input
                    type="text"
                    value={formData().nama}
                    onInput={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Stok Field (only for Produk) */}
                {activeTab() === 'produk' && (
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      <div class="flex items-center gap-2">
                        <Hash size={16} />
                        Stok
                      </div>
                    </label>
                    <input
                      type="number"
                      value={formData().stok}
                      onInput={(e) => setFormData(prev => ({ ...prev, stok: parseInt(e.target.value) || 0 }))}
                      class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      min="0"
                      required
                    />
                  </div>
                )}

                {/* Estimasi Waktu Field (only for Treatment) */}
                {activeTab() === 'treatment' && (
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      <div class="flex items-center gap-2">
                        <Clock size={16} />
                        Estimasi Waktu (menit)
                      </div>
                    </label>
                    <input
                      type="number"
                      value={formData().estimasiWaktu}
                      onInput={(e) => setFormData(prev => ({ ...prev, estimasiWaktu: parseInt(e.target.value) || 0 }))}
                      class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      min="0"
                      required
                    />
                  </div>
                )}

                {/* Harga Field */}
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <div class="flex items-center gap-2">
                      <DollarSign size={16} />
                      Harga (Rp)
                    </div>
                  </label>
                  <input
                    type="number"
                    value={formData().harga}
                    onInput={(e) => setFormData(prev => ({ ...prev, harga: parseInt(e.target.value) || 0 }))}
                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    min="0"
                    required
                  />
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
                    {editingItem() ? 'Update' : 'Tambah'}
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

export default ProdukTreatmentPage;