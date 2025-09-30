// src/services/api.js

const API_BASE_URL = "https://product-transparency-gbny.onrender.com/api";

// ✅ Check backend connection
export async function testBackend() {
  const response = await fetch(`${API_BASE_URL}/health`, { // Optional if you made a /health route
    method: "GET",
  });
  const data = await response.text();
  return data;
}

// ✅ Add product to backend
export async function addProduct(productData) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw new Error("Failed to add product");
  }

  return await response.json();
}

// ✅ Get all products
export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return await response.json();
}
