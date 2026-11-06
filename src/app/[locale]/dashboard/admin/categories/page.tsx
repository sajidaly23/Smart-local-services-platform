"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Plus, Trash2, Layers, Wrench } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminCategoriesPage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Wrench");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([userData, catData]) => {
        if (userData.success) setUser(userData.user);
        if (catData.success) setCategories(catData.categories);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, icon }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to create category");
        return;
      }

      toast.success("Category created successfully!");
      setIsOpen(false);
      setName("");
      setDescription("");
      fetchCategories();
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <DashboardLayout
      user={user || { id: "", name: "Admin", email: "", role: "admin" }}
      title="Service Categories"
      subtitle="Curate the industry taxonomy and local trade classifications"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Total {categories.length} active service classifications
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add New Category</span>
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading categories..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 font-bold">
                      <Layers className="h-5 w-5" />
                    </div>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  Slug: {c.slug}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Service Category"
        description="Add a new trade or freelance specialty to the platform"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Solar Energy Specialists"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Icon Theme
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              aria-label="Select Icon Theme"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="Zap">Zap (Electrical / Power)</option>
              <option value="Wrench">Wrench (Plumbing / Mechanical)</option>
              <option value="Hammer">Hammer (Carpentry / Construction)</option>
              <option value="Laptop">Laptop (IT / Hardware)</option>
              <option value="Code">Code (Software / Web)</option>
              <option value="BookOpen">BookOpen (Tutoring / Education)</option>
              <option value="Camera">Camera (Photography / Media)</option>
              <option value="Paintbrush">Paintbrush (Decor / Painting)</option>
            </select>
          </div>

          <Textarea
            label="Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the trade scope..."
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

