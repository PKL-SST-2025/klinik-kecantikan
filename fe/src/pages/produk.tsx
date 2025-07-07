import { Component, createSignal, createMemo, onMount } from 'solid-js';
import AgGridSolid from 'solid-ag-grid';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

import 'solid-ag-grid/dist/styles/ag-grid.css';
import 'solid-ag-grid/dist/styles/ag-theme-alpine.css';
import { Plus, Edit, Trash2, Package, Clock, DollarSign, Hash } from 'lucide-solid';
import toast, { Toaster } from 'solid-toast';

// Types
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

  // Form state
  const [formData, setFormData] = createSignal({
    nama: '',
    stok: 0,
    harga: 0,
    estimasiWaktu: 0
  });

  // Initialize with sample data
  onMount(() => {
    setProdukList([
      { id: 1, nama: 'Serum Vitamin C', stok: 25, harga: 150000 },
      { id: 2, nama: 'Moisturizer Anti-Aging', stok: 18, harga: 280000 },
      { id: 3, nama: 'Sunscreen SPF 50', stok: 32, harga: 120000 },
    ]);

    setTreatmentList([
      { id: 1, nama: 'Facial Hydrating', estimasiWaktu: 60, harga: 200000 },
      { id: 2, nama: 'Chemical Peeling', estimasiWaktu: 90, harga: 350000 },
      { id: 3, nama: 'Microneedling', estimasiWaktu: 75, harga: 450000 },
    ]);
  });

  // Helper function to handle action clicks
  const handleActionClick = (action: string, id: number) => {
    if (action === 'edit') {
      handleEdit(id);
    } else if (action === 'delete') {
      handleDelete(id);
    }
  };

  // AG-Grid column definitions
  const produkColumns = createMemo((): ColDef[] => [
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
              class="text-blue-600 hover:text-blue-800 p-1 rounded"
              onClick={() => handleActionClick('edit', params.data.id)}
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              class="text-red-600 hover:text-red-800 p-1 rounded"
              onClick={() => handleActionClick('delete', params.data.id)}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      }
    }
  ]);

  const treatmentColumns = createMemo((): ColDef[] => [
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
              class="text-blue-600 hover:text-blue-800 p-1 rounded"
              onClick={() => handleActionClick('edit', params.data.id)}
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              class="text-red-600 hover:text-red-800 p-1 rounded"
              onClick={() => handleActionClick('delete', params.data.id)}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      }
    }
  ]);

  // Event handlers
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  const handleEdit = (id: number) => {
    if (activeTab() === 'produk') {
      const item = produkList().find(p => p.id === id);
      if (item) {
        setEditingItem(item);
        setFormData({
          nama: item.nama,
          stok: item.stok,
          harga: item.harga,
          estimasiWaktu: 0
        });
        setIsModalOpen(true);
      }
    } else {
      const item = treatmentList().find(t => t.id === id);
      if (item) {
        setEditingItem(item);
        setFormData({
          nama: item.nama,
          stok: 0,
          harga: item.harga,
          estimasiWaktu: item.estimasiWaktu
        });
        setIsModalOpen(true);
      }
    }
  };

  const handleDelete = (id: number) => {
    if (activeTab() === 'produk') {
      setProdukList(prev => prev.filter(p => p.id !== id));
      toast.success('Produk berhasil dihapus');
    } else {
      setTreatmentList(prev => prev.filter(t => t.id !== id));
      toast.success('Treatment berhasil dihapus');
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    if (activeTab() === 'produk') {
      const newProduk: Produk = {
        id: editingItem() ? editingItem()!.id : Date.now(),
        nama: formData().nama,
        stok: formData().stok,
        harga: formData().harga
      };

      if (editingItem()) {
        setProdukList(prev => prev.map(p => p.id === newProduk.id ? newProduk : p));
        toast.success('Produk berhasil diupdate');
      } else {
        setProdukList(prev => [...prev, newProduk]);
        toast.success('Produk berhasil ditambahkan');
      }
    } else {
      const newTreatment: Treatment = {
        id: editingItem() ? editingItem()!.id : Date.now(),
        nama: formData().nama,
        estimasiWaktu: formData().estimasiWaktu,
        harga: formData().harga
      };

      if (editingItem()) {
        setTreatmentList(prev => prev.map(t => t.id === newTreatment.id ? newTreatment : t));
        toast.success('Treatment berhasil diupdate');
      } else {
        setTreatmentList(prev => [...prev, newTreatment]);
        toast.success('Treatment berhasil ditambahkan');
      }
    }

    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ nama: '', stok: 0, harga: 0, estimasiWaktu: 0 });
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ nama: '', stok: 0, harga: 0, estimasiWaktu: 0 });
    setIsModalOpen(true);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Produk & Treatment</h1>
        <p class="text-gray-600">Kelola produk dan treatment yang tersedia di klinik kecantikan</p>
      </div>

      {/* Tabs */}
      <div class="mb-6">
        <nav class="flex space-x-8 border-b border-gray-200">
          <button
            class={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab() === 'produk'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('produk')}
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
            }`}
            onClick={() => setActiveTab('treatment')}
          >
            <div class="flex items-center gap-2">
              <Clock size={16} />
              Treatment
            </div>
          </button>
        </nav>
      </div>

      {/* Content Card */}
      <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8">
        {/* Header dengan Add Button */}
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
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
            onClick={openAddModal}
          >
            <Plus size={16} />
            Tambah {activeTab() === 'produk' ? 'Produk' : 'Treatment'}
          </button>
        </div>

        {/* Table */}
        <div class="ag-theme-alpine rounded-xl overflow-hidden border border-gray-200" style={{ height: '500px' }}>
          <AgGridSolid
            columnDefs={activeTab() === 'produk' ? produkColumns() : treatmentColumns()}
            rowData={activeTab() === 'produk' ? produkList() : treatmentList()}
            onGridReady={onGridReady}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true
            }}
            pagination={true}
            paginationPageSize={10}
            domLayout="normal"
          />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen() && (
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">
                {editingItem() ? 'Edit' : 'Tambah'} {activeTab() === 'produk' ? 'Produk' : 'Treatment'}
              </h3>
              
              <form onSubmit={handleSubmit} class="space-y-4">
                {/* Nama Field */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nama {activeTab() === 'produk' ? 'Produk' : 'Treatment'}
                  </label>
                  <input
                    type="text"
                    value={formData().nama}
                    onInput={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Stok Field (hanya untuk produk) */}
                {activeTab() === 'produk' && (
                  <div>
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
                      class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      required
                    />
                  </div>
                )}

                {/* Estimasi Waktu Field (hanya untuk treatment) */}
                {activeTab() === 'treatment' && (
                  <div>
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
                      class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      required
                    />
                  </div>
                )}

                {/* Harga Field */}
                <div>
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
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