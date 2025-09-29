// src/services/api.js
export async function testBackend() {
  const response = await fetch("https://product-transparency-two.vercel.app/", {
    method: "GET",
  });
  const data = await response.text();
  return data;
}
