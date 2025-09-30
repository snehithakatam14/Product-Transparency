import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import "./App.css";

const API = process.env.REACT_APP_API_URL || "https://product-transparency-gbny.onrender.com";

export default function ProductLists() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/api/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  // ✅ Delete a product
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API}/api/products/${id}`);
      alert("🗑️ Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      alert("❌ Failed to delete product");
    }
  };

  // ✅ Start editing a product
  const startEditing = (product) => {
    setEditingProduct(product._id);
    setUpdatedData({
      name: product.name,
      brand: product.brand,
      price: product.price,
      description: product.description,
    });
  };

  // ✅ Update input changes while editing
  const handleUpdateChange = (e) => {
    setUpdatedData({ ...updatedData, [e.target.name]: e.target.value });
  };

  // ✅ Save the updated product
  const saveUpdate = async (id) => {
    try {
      await axios.put(`${API}/api/products/${id}`, updatedData);
      alert("✅ Product updated!");
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      alert("❌ Failed to update product");
    }
  };

  // ✅ Export all products as CSV
  const exportCSV = () => {
    const csvData = products.map((p) => ({
      Name: p.name,
      Brand: p.brand,
      Price: p.price,
      Description: p.description,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "products_export.csv");
  };

  // ✅ Download PDF report for a product
  const downloadReport = async (id, name) => {
    try {
      const resp = await fetch(`${API}/api/products/${id}/pdf`, { method: "GET" });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Failed to get PDF: ${resp.status} ${text}`);
      }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name || "product"}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error downloading report:", error);
      alert("❌ Failed to download report");
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>📦 All Products</h2>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={exportCSV} className="btn neon-btn">📁 Export as CSV</button>
      </div>

      {products.length === 0 && <p>No products found.</p>}

      {products.map((p) => (
        <div
          key={p._id}
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "18px",
            margin: "12px 0",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.02)"
          }}
        >
          {editingProduct === p._id ? (
            <>
              <input type="text" name="name" value={updatedData.name} onChange={handleUpdateChange} />
              <input type="text" name="brand" value={updatedData.brand} onChange={handleUpdateChange} />
              <input type="number" name="price" value={updatedData.price} onChange={handleUpdateChange} />
              <textarea name="description" value={updatedData.description} onChange={handleUpdateChange} />
              <br />
              <button onClick={() => saveUpdate(p._id)} className="btn">💾 Save</button>
              <button onClick={() => setEditingProduct(null)} className="btn">❌ Cancel</button>
            </>
          ) : (
            <>
              <h3 style={{ margin: "0 0 6px 0" }}>{p.name}</h3>
              <p style={{ margin: 0 }}>Brand: {p.brand}</p>
              <p style={{ margin: 0 }}>Price: ${p.price}</p>
              <p style={{ marginTop: "8px" }}>{p.description}</p>

              <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={() => startEditing(p)} className="btn">✏️ Edit</button>
                <button onClick={() => deleteProduct(p._id)} className="btn">🗑️ Delete</button>
                <button onClick={() => downloadReport(p._id, p.name)} className="btn neon-btn">📄 Download Report</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
