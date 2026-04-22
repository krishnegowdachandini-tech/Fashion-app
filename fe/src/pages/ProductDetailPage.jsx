import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { categoryApi, getImageUrl } from "../services/api";
import { useCart } from "../context/CartContext";

const CATEGORY_LABEL = { specs: "Eyewear", bags: "Bags", cosmetics: "Cosmetics" };

export default function ProductDetailPage() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const api = categoryApi[category];

  useEffect(() => {
    if (!api) {
      navigate("/products");
      return;
    }
    setLoading(true);
    api
      .getById(id)
      .then((res) => {
        setProduct(res.data);
        setEditForm(flattenForForm(res.data));
      })
      .catch(() => navigate("/products"))
      .finally(() => setLoading(false));
  }, [category, id]);

  // Flatten nested objects for form fields
  const flattenForForm = (p) => ({
    name: p.name || "",
    brand: p.brand || "",
    price: p.price ?? "",
    stock: p.stock ?? "",
    description: p.description || "",
    // category-specific
    frameColor: p.frameColor || "",
    lensColor: p.lensColor || "",
    frameMaterial: p.frameMaterial || "",
    color: p.color || "",
    material: p.material || "",
    subCategory: p.subCategory || "",
    shade: p.shade || "",
    skinType: p.skinType || "",
    gender: p.gender || "",
    imageUrl: p.images?.[0] || "",
    tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
  });

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    setSaveError("");
    try {
      const payload = {
        name: editForm.name,
        brand: editForm.brand,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock),
        description: editForm.description,
        gender: editForm.gender,
        images: editForm.imageUrl ? [editForm.imageUrl] : product.images,
        tags: editForm.tags ? editForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        // category-specific
        ...(category === "specs" && {
          frameColor: editForm.frameColor,
          lensColor: editForm.lensColor,
          frameMaterial: editForm.frameMaterial,
        }),
        ...(category === "bags" && {
          color: editForm.color,
          material: editForm.material,
        }),
        ...(category === "cosmetics" && {
          subCategory: editForm.subCategory,
          shade: editForm.shade,
          skinType: editForm.skinType,
        }),
      };
      const res = await api.update(id, payload);
      setProduct(res.data);
      setEditForm(flattenForForm(res.data));
      setSaveMsg("Product updated successfully!");
      setEditOpen(false);
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.remove(id);
      navigate("/products");
    } catch {
      setSaveError("Failed to delete product.");
      setDeleteConfirm(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
        <div className="bg-skin-100 rounded-3xl h-96" />
        <div className="space-y-4">
          <div className="h-6 bg-skin-100 rounded w-1/3" />
          <div className="h-9 bg-skin-100 rounded w-2/3" />
          <div className="h-4 bg-skin-100 rounded w-1/2" />
          <div className="h-20 bg-skin-100 rounded" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const imageUrl = getImageUrl(editForm.imageUrl || product.images?.[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-skin-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-skin-600 transition-colors">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${category}`} className="hover:text-skin-600 transition-colors capitalize">
          {CATEGORY_LABEL[category]}
        </Link>
        <span>/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      {/* Success / error toast */}
      {saveMsg && (
        <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 text-sm font-medium">
          ✓ {saveMsg}
        </div>
      )}
      {saveError && (
        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm">
          {saveError}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden bg-skin-50 border border-skin-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full max-h-[480px] object-cover"
              onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}/600/420`; }}
            />
          ) : (
            <div className="h-96 flex items-center justify-center text-skin-300 text-lg">No image</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-widest text-skin-400 mb-2">
            {CATEGORY_LABEL[category]}
          </span>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-400 text-sm mt-1 mb-4">{product.brand}</p>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Specs-specific */}
          {category === "specs" && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[["Frame", product.frameColor], ["Lens", product.lensColor], ["Material", product.frameMaterial]].map(([k, v]) => v && (
                <div key={k} className="bg-skin-50 rounded-xl px-3 py-2 text-center">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* Bags-specific */}
          {category === "bags" && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[["Color", product.color], ["Material", product.material]].map(([k, v]) => v && (
                <div key={k} className="bg-skin-50 rounded-xl px-3 py-2 text-center">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* Cosmetics-specific */}
          {category === "cosmetics" && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[["Type", product.subCategory], ["Shade", product.shade], ["Skin Type", product.skinType]].map(([k, v]) => v && (
                <div key={k} className="bg-skin-50 rounded-xl px-3 py-2 text-center">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs bg-skin-100 text-skin-700 px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          {/* Price + stock */}
          <div className="flex items-center gap-4 mt-6">
            <span className="text-3xl font-bold text-skin-700">${product.price.toFixed(2)}</span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-skin-50 transition-colors"
              >−</button>
              <span className="px-4 text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-skin-50 transition-colors"
              >+</button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-skin-500 text-white py-3 rounded-xl font-semibold hover:bg-skin-600 transition-colors disabled:opacity-40"
            >
              {addedMsg ? "✓ Added to Cart!" : "Add to Cart"}
            </button>

            <Link
              to="/cart"
              className="px-5 py-3 rounded-xl border-2 border-skin-500 text-skin-600 font-semibold hover:bg-skin-50 transition-colors text-sm"
            >
              View Cart
            </Link>
          </div>

          {/* Edit / Delete buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => { setEditOpen((o) => !o); setSaveMsg(""); setSaveError(""); }}
              className="flex items-center gap-2 text-sm text-skin-600 border border-skin-300 px-4 py-2 rounded-xl hover:bg-skin-50 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {editOpen ? "Cancel Edit" : "Edit Product"}
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete product?</h3>
            <p className="text-sm text-gray-500 mt-2">This will permanently remove <strong>{product.name}</strong> from the catalog.</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >Cancel</button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit form */}
      {editOpen && (
        <div className="mt-12 bg-white border border-skin-200 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Product Details</h2>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Product Name" name="name" value={editForm.name} onChange={handleEditChange} required />
              <Field label="Brand" name="brand" value={editForm.brand} onChange={handleEditChange} required />
              <Field label="Price ($)" name="price" type="number" step="0.01" min="0" value={editForm.price} onChange={handleEditChange} required />
              <Field label="Stock" name="stock" type="number" min="0" value={editForm.stock} onChange={handleEditChange} required />
              <Field label="Gender" name="gender" value={editForm.gender} onChange={handleEditChange} />
              <Field label="Tags (comma-separated)" name="tags" value={editForm.tags} onChange={handleEditChange} />
              <div className="md:col-span-2">
                <Field label="Description" name="description" value={editForm.description} onChange={handleEditChange} textarea />
              </div>
              <div className="md:col-span-2">
                <Field label="Image URL (paste a new URL to change image)" name="imageUrl" value={editForm.imageUrl} onChange={handleEditChange} />
              </div>

              {/* Category-specific fields */}
              {category === "specs" && (
                <>
                  <Field label="Frame Color" name="frameColor" value={editForm.frameColor} onChange={handleEditChange} />
                  <Field label="Lens Color" name="lensColor" value={editForm.lensColor} onChange={handleEditChange} />
                  <Field label="Frame Material" name="frameMaterial" value={editForm.frameMaterial} onChange={handleEditChange} />
                </>
              )}
              {category === "bags" && (
                <>
                  <Field label="Color" name="color" value={editForm.color} onChange={handleEditChange} />
                  <Field label="Material" name="material" value={editForm.material} onChange={handleEditChange} />
                </>
              )}
              {category === "cosmetics" && (
                <>
                  <Field label="Sub-category (face/lips/eyes)" name="subCategory" value={editForm.subCategory} onChange={handleEditChange} />
                  <Field label="Shade" name="shade" value={editForm.shade} onChange={handleEditChange} />
                  <Field label="Skin Type" name="skinType" value={editForm.skinType} onChange={handleEditChange} />
                </>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={saving}
                className="bg-skin-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-skin-600 transition-colors disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => { setEditOpen(false); setEditForm(flattenForForm(product)); }}
                className="px-8 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", step, min, required, textarea }) {
  const cls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-skin-300 focus:border-transparent";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} rows={3} className={cls} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} step={step} min={min} required={required} className={cls} />
      )}
    </div>
  );
}
