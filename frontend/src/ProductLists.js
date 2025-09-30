import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

export default function ProductLists() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch products
  useEffect(() => {
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
    fetchProducts();
  }, []);

  // ✅ Export CSV
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

  // ✅ Download PDF
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

  // ✅ Edit Product
  const editProduct = async (id) => {
    const newName = prompt("Enter new product name:");
    if (!newName) return;
    try {
      await axios.put(`${API_BASE_URL}/api/products/${id}`, { name: newName });
      setProducts(products.map((p) => (p._id === id ? { ...p, name: newName } : p)));
    } catch (err) {
      console.error("❌ Failed to edit product:", err);
      alert("Update failed");
    }
  };

  // ✅ Delete Product
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete product:", err);
      alert("Delete failed");
    }
  };

  if (loading) return <p>📦 Loading products...</p>;
  if (products.length === 0) return <p>❌ No products found.</p>;

  return (
    <div className="product-list">
      <h2>📋 Product List</h2>

      {/* ✅ CSV & PDF buttons */}
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={exportCSV} style={{ marginRight: "10px" }}>
          📤 Export CSV
        </button>
        <button onClick={downloadPDF}>📄 Download PDF</button>
      </div>

      {/* ✅ Product cards */}
      {products.map((p) => (
        <div key={p._id} className="product-card" style={{ marginBottom: "1rem" }}>
          <h3>{p.name}</h3>
          <p>
            <strong>Brand:</strong> {p.brand}
          </p>
          <p>
            <strong>Price:</strong> ₹{p.price}
          </p>
          <p>
            <strong>Description:</strong> {p.description}
          </p>

          <button onClick={() => editProduct(p._id)}>✏️ Edit</button>
          <button
            onClick={() => deleteProduct(p._id)}
            style={{ marginLeft: "8px", color: "white", background: "red" }}
          >
            🗑️ Delete
          </button>
        </div>
      ))}
    </div>
  );
}
