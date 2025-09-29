const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Product = require("./models/Product");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS — allow frontend + localhost (important!)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://product-transparency-two.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ Body parser
app.use(bodyParser.json());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully 🚀");
});

// ✅ Add sample product (for testing)
app.get("/add-product", async (req, res) => {
  try {
    const newProduct = new Product({
      name: "Laptop",
      brand: "Dell",
      price: 799,
      description: "A powerful laptop for developers",
    });
    await newProduct.save();
    res.send("✅ Product added to database!");
  } catch (error) {
    console.error("❌ Error adding sample product:", error);
    res.status(500).send("❌ Failed to add product");
  }
});

// ✅ Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).send("❌ Failed to fetch products");
  }
});

// ✅ Add product (main route frontend uses)
app.post("/api/products", async (req, res) => {
  try {
    const { name, brand, price, description } = req.body;

    // Basic validation
    if (!name || !brand) {
      return res.status(400).json({ error: "Name and brand are required" });
    }

    const newProduct = new Product({ name, brand, price, description });
    await newProduct.save();

    res.status(201).json({ message: "✅ Product added", product: newProduct });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ error: error.message || "Failed to add product" });
  }
});

// ✅ Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, brand, price, description } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, brand, price, description },
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ error: "Product not found" });

    res.json({ message: "✅ Product updated", product: updatedProduct });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ error: error.message || "Failed to update product" });
  }
});

// ✅ Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ✅ Generate PDF report
app.get("/api/products/pdf", async (req, res) => {
  try {
    const products = await Product.find();
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, "products-report.pdf");
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(20).text("📊 Product Report", { align: "center" });
    doc.moveDown();

    products.forEach((p, index) => {
      doc
        .fontSize(14)
        .text(`🆔 Product #${index + 1}`)
        .fontSize(12)
        .text(`Name: ${p.name}`)
        .text(`Brand: ${p.brand}`)
        .text(`Price: $${p.price}`)
        .text(`Description: ${p.description}`)
        .moveDown();
    });

    doc.end();

    writeStream.on("finish", () => {
      res.download(filePath, "products-report.pdf", (err) => {
        if (err) console.error("❌ Error sending PDF:", err);
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    res.status(500).send("❌ Failed to generate PDF");
  }
});

// ✅ Start server
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
