"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  active: number;
  createdAt: string;
}

const emptyForm = {
  name: "",
  icon: "",
  color: "bg-gray-500/10 text-gray-400",
  sortOrder: "0",
  active: true,
};

export default function AdminCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user?.isAdmin) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const body: Record<string, unknown> = {
      name: form.name,
      icon: form.icon,
      color: form.color,
      sortOrder: parseInt(form.sortOrder),
    };

    if (editingId) {
      body.id = editingId;
      body.active = form.active ? 1 : 0;
      await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setSubmitting(false);
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    await fetchCategories();
  }

  async function handleDelete(id: string) {
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleteConfirm(null);
    await fetchCategories();
  }

  async function handleToggleActive(category: Category) {
    await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category.id, active: category.active ? 0 : 1 }),
    });
    await fetchCategories();
  }

  function openEdit(category: Category) {
    setForm({
      name: category.name,
      icon: category.icon,
      color: category.color,
      sortOrder: category.sortOrder.toString(),
      active: category.active === 1,
    });
    setEditingId(category.id);
    setShowModal(true);
  }

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400 text-2xl font-bold">Unauthorized</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            &larr; Back
          </button>
          <button
            onClick={openAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Category
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-3 px-2">Order</th>
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Icon</th>
              <th className="text-left py-3 px-2">Color</th>
              <th className="text-left py-3 px-2">Active</th>
              <th className="text-right py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                <td className="py-3 px-2 text-gray-400">{category.sortOrder}</td>
                <td className="py-3 px-2 font-medium">{category.name}</td>
                <td className="py-3 px-2 text-xl">{category.icon || "-"}</td>
                <td className="py-3 px-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${category.color}`}>
                    {category.color}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <button
                    onClick={() => handleToggleActive(category)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      category.active
                        ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                        : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    }`}
                  >
                    {category.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="py-3 px-2 text-right">
                  <button
                    onClick={() => openEdit(category)}
                    className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(category.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="🚀"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Color (Tailwind classes)
                </label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="bg-blue-500/10 text-blue-400"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
                {form.color && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-400">Preview:</span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${form.color}`}>
                      Example
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sort Order</label>
                <input
                  type="number"
                  required
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="active" className="text-sm text-gray-400">
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this category?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
