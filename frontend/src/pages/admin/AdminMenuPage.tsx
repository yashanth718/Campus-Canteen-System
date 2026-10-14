import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Check, X, Utensils, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { MenuItem, Category } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminMenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('breakfast');
  const [price, setPrice] = useState<number>(50);
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState(12);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuData, catData] = await Promise.all([api.getMenuItems(), api.getCategories()]);
      setItems(menuData);
      setCategories(catData);
      if (catData.length > 0 && !editingItem) {
        setCategoryId(catData[0].categoryId);
      }
    } catch (err) {
      console.error('Failed to load menu management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setCategoryId(categories[0]?.categoryId || 'breakfast');
    setPrice(50);
    setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setAvailable(true);
    setPreparationTimeMinutes(12);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setCategoryId(item.categoryId);
    setPrice(item.price);
    setImageUrl(item.imageUrl);
    setAvailable(item.available);
    setPreparationTimeMinutes(item.preparationTimeMinutes || 12);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      if (editingItem) {
        const updated = await api.updateMenuItem(editingItem.itemId, {
          name,
          description,
          categoryId,
          price: Number(price),
          imageUrl,
          available,
          preparationTimeMinutes: Number(preparationTimeMinutes),
        });
        setItems((prev) => prev.map((i) => (i.itemId === updated.itemId ? updated : i)));
      } else {
        const created = await api.createMenuItem({
          name,
          description,
          categoryId,
          price: Number(price),
          imageUrl,
          available,
          preparationTimeMinutes: Number(preparationTimeMinutes),
        });
        setItems((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updated = await api.toggleAvailability(item.itemId, !item.available);
      setItems((prev) => prev.map((i) => (i.itemId === updated.itemId ? updated : i)));
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteMenuItem(deleteTarget.itemId);
      setItems((prev) => prev.filter((i) => i.itemId !== deleteTarget.itemId));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedCat !== 'all' && item.categoryId !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Food Menu & Dishes Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new dishes, update prices, toggle live availability, and manage campus categories.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish by name..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCat === 'all' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.categoryId}
              onClick={() => setSelectedCat(c.categoryId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCat === c.categoryId
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Table */}
      {loading ? (
        <LoadingSpinner message="Loading food menu..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Dish</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Prep Time</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredItems.map((item) => (
                  <tr key={item.itemId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 block text-sm">{item.name}</span>
                          <span className="text-slate-400 line-clamp-1 max-w-xs">{item.description}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold capitalize">
                        {item.categoryId}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-extrabold text-slate-900 text-sm">₹{item.price}</td>
                    <td className="py-3 px-4 text-slate-500">{item.preparationTimeMinutes || 12} mins</td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          item.available
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                        title="Click to toggle availability"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        />
                        <span>{item.available ? 'In Stock' : 'Sold Out'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition"
                          title="Edit Dish"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Dish Details' : 'Add New Dish to Canteen'}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paneer Butter Masala"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Delicious cottage cheese in a rich creamy tomato gravy..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹ INR) *</label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prep Time (Mins)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={preparationTimeMinutes}
                onChange={(e) => setPreparationTimeMinutes(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Availability</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="availCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Available for Ordering
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Dish'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteItem}
        title="Delete Menu Dish?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Students will no longer see this dish in the canteen catalog.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};
