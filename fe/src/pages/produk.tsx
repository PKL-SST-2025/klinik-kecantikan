import { createSignal, createMemo, onMount, createEffect, Component, JSX } from 'solid-js';
import AgGridSolid from 'solid-ag-grid';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import '../styles/ag-custom-purple.css';
import { Plus, Edit, Trash2, Package, Clock, DollarSign, Hash, AlignLeft } from 'lucide-solid';
import toast, { Toaster } from 'solid-toast';
import { addNotification, removeNotificationByKeyword, notifications } from '../stores/notificationStores';
import {ProdukFromBackend, TreatmentFromBackend} from '../types/database';
type TabType = 'produk' | 'treatment';

// Tipe data yang sesuai dengan backend Rust


const ProdukTreatmentPage: Component = () => {
  const [activeTab, setActiveTab] = createSignal<TabType>('produk');
  const [produkList, setProdukList] = createSignal<ProdukFromBackend[]>([]);
  const [treatmentList, setTreatmentList] = createSignal<TreatmentFromBackend[]>([]);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editingItem, setEditingItem] = createSignal<ProdukFromBackend | TreatmentFromBackend | null>(null);
  const [gridApi, setGridApi] = createSignal<GridApi | null>(null);
  const [isDataLoaded, setIsDataLoaded] = createSignal(false);

  const [formData, setFormData] = createSignal({
    name: '',
    description: '',
    stock: 0,
    price: 0,
    estimated_time: 0,
  });

  // --- API Functions for Produk ---
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/products');
      if (response.ok) {
        const data: ProdukFromBackend[] = await response.json();
        setProdukList(data);
      } else {
        toast.error('Gagal memuat data produk.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal terhubung ke server.');
    }
  };

  const createProduct = async (data: any) => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast.success('Produk berhasil ditambahkan.');
        fetchProducts();
        return true;
      } else {
        const errorText = await response.text();
        toast.error(`Gagal menambah produk: ${errorText}`);
        return false;
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server.');
      return false;
    }
  };

  const updateProduct = async (id: string, data: any) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast.success('Produk berhasil diupdate.');
        fetchProducts();
        return true;
      } else {
        const errorText = await response.text();
        toast.error(`Gagal mengupdate produk: ${errorText}`);
        return false;
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server.');
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Produk berhasil dihapus.');
        fetchProducts();
        return true;
      } else {
        const errorText = await response.text();
        toast.error(`Gagal menghapus produk: ${errorText}`);
        return false;
      }
    }
    catch (error) {
        // This is the added catch block to handle network or other errors.
        console.error('Error deleting product:', error);
        toast.error('Gagal terhubung ke server.');
        return false;
    }
  };

  // --- API Functions for Treatment ---
  const fetchTreatments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/treatments');
      if (response.ok) {
        const data: TreatmentFromBackend[] = await response.json();
        setTreatmentList(data);
      } else {
        toast.error('Gagal memuat data treatment.');
      }
    } catch (error) {
      console.error('Error fetching treatments:', error);
      toast.error('Gagal terhubung ke server.');
    }
  };

  const createTreatment = async (data: any) => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast.success('Treatment berhasil ditambahkan.');
        fetchTreatments();
        return true;
      } else {
        const errorText = await response.text();
        toast.error(`Gagal menambah treatment: ${errorText}`);
        return false;
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server.');
      return false;
    }
  };

  const updateTreatment = async (id: string, data: any) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/treatments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast.success('Treatment berhasil diupdate.');
        fetchTreatments();
        return true;
      } else {
        const errorText = await response.text();
        toast.error(`Gagal mengupdate treatment: ${errorText}`);
        return false;
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server.');
      return false;
    }
  };

  const deleteTreatment = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/treatments/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Treatment berhasil dihapus.');
        fetchTreatments();
        return true;
      } else {
        const errorText = await response.text();
        toast.error(`Gagal menghapus treatment: ${errorText}`);
        return false;
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server.');
      return false;
    }
  };

  // --- Lifecycle Hooks ---
  onMount(() => {
    fetchProducts();
    fetchTreatments();
    setIsDataLoaded(true);
  });

  createEffect(() => {
    if (activeTab() === 'produk' && isDataLoaded()) {
      const lowStokProduk = produkList().filter(p => p.stock <= 5);
      const existingMessages = new Set(notifications().map(n => n.message));

      lowStokProduk.forEach((produk) => {
        const message = `Stok produk "${produk.name}" menipis (${produk.stock} pcs)`;
        if (!existingMessages.has(message)) {
          addNotification(message);
        }
      });
    }
  });

  createEffect(() => {
    const api = gridApi();
    if (api) {
      setTimeout(() => api.sizeColumnsToFit(), 0);
    }
  });

  // --- Handlers & AG-Grid Column Definitions ---

  const handleActionClick = (action: string, id: string) => {
    if (action === 'edit') {
      handleEdit(id);
    } else if (action === 'delete') {
      handleDelete(id);
    }
  };

  const produkColumns = createMemo((): ColDef[] => {
    return [
      { field: 'id', headerName: 'ID', hide: true },
      { field: 'name', headerName: 'Nama Produk', flex: 1, sortable: true },
      { field: 'description', headerName: 'Deskripsi', flex: 2, sortable: true },
      {
        field: 'stock',
        headerName: 'Stok',
        width: 100,
        sortable: true,
        valueFormatter: (params: any) => `${params.value} pcs`,
        cellStyle: (params) => {
          if (params.value <= 5) {
            return { color: '#ff69b4', 'font-weight': 'bold' };
          }
          return null;
        },
      },
      {
        field: 'price',
        headerName: 'Harga',
        width: 130,
        sortable: true,
        valueFormatter: (params: any) => `Rp ${params.value.toLocaleString('id-ID')}`,
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
        },
      },
    ];
  });

  const treatmentColumns = createMemo((): ColDef[] => {
    return [
      { field: 'id', headerName: 'ID', hide: true },
      { field: 'name', headerName: 'Nama Treatment', flex: 1, sortable: true },
      { field: 'description', headerName: 'Deskripsi', flex: 2, sortable: true },
      {
        field: 'estimated_time',
        headerName: 'Estimasi Waktu',
        width: 150,
        sortable: true,
        valueFormatter: (params: any) => `${params.value} menit`,
      },
      {
        field: 'price',
        headerName: 'Harga',
        width: 130,
        sortable: true,
        valueFormatter: (params: any) => `Rp ${params.value.toLocaleString('id-ID')}`,
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
        },
      },
    ];
  });

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const handleEdit = (id: string) => {
    if (activeTab() === 'produk') {
      const item = produkList().find(p => p.id === id);
      if (item) {
        setEditingItem(item);
        setFormData({
          name: item.name,
          description: item.description,
          stock: item.stock,
          price: item.price,
          estimated_time: 0,
        });
        setIsModalOpen(true);
      }
    } else {
      const item = treatmentList().find(t => t.id === id);
      if (item) {
        setEditingItem(item);
        setFormData({
          name: item.name,
          description: item.description,
          stock: 0,
          price: item.price,
          estimated_time: item.estimated_time,
        });
        setIsModalOpen(true);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (activeTab() === 'produk') {
      deleteProduct(id);
    } else {
      deleteTreatment(id);
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (activeTab() === 'produk') {
      const data = {
        name: formData().name,
        description: formData().description,
        price: formData().price,
        stock: formData().stock,
      };
      if (editingItem()) {
        const id = (editingItem() as ProdukFromBackend).id;
        updateProduct(id, data);
      } else {
        createProduct(data);
      }
    } else {
      const data = {
        name: formData().name,
        description: formData().description,
        price: formData().price,
        estimated_time: formData().estimated_time,
      };
      if (editingItem()) {
        const id = (editingItem() as TreatmentFromBackend).id;
        updateTreatment(id, data);
      } else {
        createTreatment(data);
      }
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ name: '', description: '', stock: 0, price: 0, estimated_time: 0 });
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', stock: 0, price: 0, estimated_time: 0 });
    setIsModalOpen(true);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (gridApi()) {
      setTimeout(() => gridApi()!.sizeColumnsToFit(), 0);
    }
  };

  const rowDataToDisplay = createMemo(() => {
    return activeTab() === 'produk' ? produkList() : treatmentList();
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 font-sans">
      <Toaster position="top-right" />

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Produk & Treatment</h1>
        <p class="text-gray-600">Kelola produk dan treatment yang tersedia di klinik kecantikan</p>
      </div>

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

      <div class="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 md:p-8">
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

        <div class="ag-theme-alpine rounded-xl overflow-hidden border border-gray-200" style={{ height: '500px', width: '100%' }}>
          {isDataLoaded() ? (
            <AgGridSolid
              columnDefs={activeTab() === 'produk' ? produkColumns() : treatmentColumns()}
              rowData={rowDataToDisplay()}
              onGridReady={onGridReady}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
                flex: 1,
                minWidth: 100,
              }}
              pagination={true}
              paginationPageSize={10}
              domLayout="autoHeight"
              animateRows={true}
            />
          ) : (
            <div class="flex justify-center items-center h-full text-gray-500">
              Memuat data tabel...
            </div>
          )}
        </div>
      </div>

      {isModalOpen() && (
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">
                {editingItem() ? 'Edit' : 'Tambah'} {activeTab() === 'produk' ? 'Produk' : 'Treatment'}
              </h3>

              <form onSubmit={handleSubmit} class="space-y-4">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nama {activeTab() === 'produk' ? 'Produk' : 'Treatment'}
                  </label>
                  <input
                    type="text"
                    value={formData().name}
                    onInput={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <div class="flex items-center gap-2">
                      <AlignLeft size={16} />
                      Deskripsi
                    </div>
                  </label>
                  <textarea
                    value={formData().description}
                    onInput={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  ></textarea>
                </div>
                
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
                      value={formData().stock}
                      onInput={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      min="0"
                      required
                    />
                  </div>
                )}

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
                      value={formData().estimated_time}
                      onInput={(e) => setFormData(prev => ({ ...prev, estimated_time: parseInt(e.target.value) || 0 }))}
                      class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      min="0"
                      required
                    />
                  </div>
                )}

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <div class="flex items-center gap-2">
                      <DollarSign size={16} />
                      Harga (Rp)
                    </div>
                  </label>
                  <input
                    type="number"
                    value={formData().price}
                    onInput={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    min="0"
                    required
                  />
                </div>

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