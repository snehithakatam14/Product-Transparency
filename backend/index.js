const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Product = require("./models/Product");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(bodyParser.json());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://admin:admin123@cluster0.jdjmjo5.mongodb.net/productDB?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully 🚀");
});

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
    res.status(500).send("❌ Failed to add product");
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send("❌ Failed to fetch products");
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, brand, price, description } = req.body;
    const newProduct = new Product({ name, brand, price, description });
    await newProduct.save();
    res.status(201).json({ message: "✅ Product added", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, brand, price, description } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, brand, price, description },
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "✅ Product updated", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

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
    res.status(500).send("❌ Failed to generate PDF");
  }
});

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
