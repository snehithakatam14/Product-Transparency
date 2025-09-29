// src/services/api.js
export async function testBackend() {
  const response = await fetch("http://localhost:5000/", {
    method: "GET",
  });
  const data = await response.text();
  return data;
}
