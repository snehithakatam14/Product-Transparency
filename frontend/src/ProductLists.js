import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

export default function ProductLists() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null); // for editing
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
  });

  // ✅ Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CSV Export
  const exportCSV = () => {
    const headers = ["Name", "Brand", "Price", "Description"];
    const csvRows = [
      headers.join(","),
      ...products.map((p) =>
        [`"${p.name}"`, `"${p.brand}"`, `"${p.price}"`, `"${p.description}"`].join(",")
      ),
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
  };

  // ✅ PDF Download
  const downloadPDF = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/pdf`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.pdf";
      a.click();
    } catch (err) {
      console.error("❌ Failed to download PDF:", err);
      alert("PDF download failed");
    }
  };

  // ✅ Delete a product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      fetchProducts(); // refresh list
    } catch (error) {
      console.error("❌ Failed to delete product:", error);
      alert("Delete failed");
    }
  };

  // ✅ Start editing a product
  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price,
      description: product.description,
    });
  };

  // ✅ Save edited product
  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/products/${editingProduct}`, formData);
      setEditingProduct(null);
      setFormData({ name: "", brand: "", price: "", description: "" });
      fetchProducts();
    } catch (err) {
      console.error("❌ Failed to update product:", err);
      alert("Update failed");
    }
  };

  if (loading) return <p>📦 Loading products...</p>;
  if (products.length === 0) return <p>❌ No products found.</p>;

  return (
    <div className="product-list">
      <h2>📋 Product List</h2>

      {/* ✅ Top Buttons */}
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={exportCSV} style={{ marginRight: "10px" }}>
          📤 Export as CSV
        </button>
        <button onClick={downloadPDF}>📄 Download PDF</button>
      </div>

      {/* ✅ Product Cards */}
      {products.map((p) => (
        <div key={p._id} className="product-card" style={{ marginBottom: "1rem" }}>
          {editingProduct === p._id ? (
            <>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
              />
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Brand"
              />
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Price"
              />
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
              />
              <button onClick={handleSave} style={{ marginRight: "8px" }}>
                💾 Save
              </button>
              <button onClick={() => setEditingProduct(null)}>❌ Cancel</button>
            </>
          ) : (
            <>
              <h3>{p.name}</h3>
              <p><strong>Brand:</strong> {p.brand}</p>
              <p><strong>Price:</strong> ₹{p.price}</p>
              <p><strong>Description:</strong> {p.description}</p>

              {/* ✅ Action Buttons */}
              <button
                onClick={() => handleEdit(p)}
                style={{
                  background: "#3b82f6",
                  color: "white",
                  padding: "5px 10px",
                  marginRight: "8px",
                  borderRadius: "5px",
                }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
