import React, { useState } from "react";
import { useProducts, Product } from "@/context/ProductsContext";
import { useUnits } from "@/context/UnitsContext";

interface ModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (p: Partial<Product>) => void;
}

const ProductModal: React.FC<ModalProps> = ({ product, onClose, onSave }) => {
  const { activeUnits } = useUnits();
  const [form, setForm] = useState({
    gtinCode: product?.gtinCode ?? "",
    productName: product?.productName ?? "",
    categoryName: product?.categoryName ?? "",
    unit: (product as any)?.unit ?? "",
  });
  const [activeTab, setActiveTab] = useState<"info" | "desc">("info");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            {product ? "Edit Product" : "New Product"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {(["info", "desc"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-t-lg border ${
                activeTab === tab
                  ? "border-b-white bg-white text-green-600 font-semibold border-gray-200"
                  : "text-gray-500 border-transparent"
              }`}
            >
              {tab === "info" ? "Product Information" : "Description"}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          {activeTab === "info" && (
            <>
              {/* Image upload */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Product Image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 transition-colors">
                  <p className="text-gray-400 text-sm">📷 Choose image (max 5)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">GTIN Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.gtinCode}
                  onChange={(e) => setForm({ ...form, gtinCode: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  value={form.categoryName}
                  onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">-- Select category --</option>
                  {["Grain", "Seafood", "Fruit", "Beverage", "Spice", "Food"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">-- Select unit --</option>
                  {activeUnits.map((u) => (
                    <option key={u.id} value={u.name}>{u.name} ({u.abbreviation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Certificate Images</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-green-400 transition-colors">
                  <p className="text-gray-400 text-sm">📜 Choose certificate (max 5)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Video URLs</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://youtube.com/..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <button className="text-green-500 hover:text-green-700 text-lg px-1">＋</button>
                </div>
              </div>
            </>
          )}
          {activeTab === "desc" && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Product Description</label>
              <textarea
                rows={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                placeholder="Enter product description..."
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            Close
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            ✓ Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [catFilter, setCatFilter] = useState("");

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = !q || p.productName.toLowerCase().includes(q) || p.gtinCode.includes(q);
    const matchCat = !catFilter || p.categoryName === catFilter;
    return matchQ && matchCat;
  });

  const handleSave = async (data: Partial<Product>) => {
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, data);
      } else {
        await addProduct({
          gtinCode: data.gtinCode ?? "",
          productName: data.productName ?? "",
          categoryName: data.categoryName ?? "",
        });
      }
    } catch (err: any) {
      alert("❌ Failed to save product: " + (err?.message ?? "Unknown error") + "\n\nCheck the browser console (F12) for more details.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this product?")) await deleteProduct(id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Products</h2>
        <button
          onClick={() => { setEditProduct(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Product
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button className="border border-gray-200 rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-50">🔍</button>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-2 text-xs text-blue-500 hover:text-blue-700"
        >
          {showAdvanced ? "▲" : "▼"} Advanced Filter
        </button>
        {showAdvanced && (
          <div className="mt-2 flex gap-3">
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-400 text-gray-600"
            >
              <option value="">All Categories</option>
              {["Grain", "Seafood", "Fruit", "Beverage", "Spice", "Food"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Actions</th>
              <th className="px-5 py-3 text-left">GTIN Code</th>
              <th className="px-5 py-3 text-left">Product Name</th>
              <th className="px-5 py-3 text-left">Category</th>
              <th className="px-5 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="relative group">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1">
                        ⚙ Actions ▾
                      </button>
                      <div className="absolute left-0 top-7 hidden group-hover:block z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]">
                        <button
                          onClick={() => { setEditProduct(row); setShowModal(true); }}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          🗑 Delete
                        </button>
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">
                          🖨 Print QR
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{row.gtinCode}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{row.productName}</td>
                  <td className="px-5 py-3">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{row.categoryName}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{row.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination stub */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
        <span>Showing {filtered.length} of {products.length} products</span>
        <div className="flex gap-1">
          <button className="px-2 py-1 border border-gray-200 rounded">‹</button>
          <button className="px-2 py-1 border border-green-500 bg-green-500 text-white rounded">1</button>
          <button className="px-2 py-1 border border-gray-200 rounded">2</button>
          <button className="px-2 py-1 border border-gray-200 rounded">›</button>
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Products;
