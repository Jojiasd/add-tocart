const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3003;  // Changed port from 3001 to 3002

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Read products from JSON
function readProducts() {
    const data = fs.readFileSync(path.join(__dirname, 'products.json'));
    return JSON.parse(data);
}

// Add a new product to the products JSON file
function addProduct(newProduct) {
    const products = readProducts();
    products.push(newProduct);
    fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify(products, null, 2));
}

// Read cart data from JSON
function readCart() {
    if (fs.existsSync(path.join(__dirname, 'cart.json'))) {
        const data = fs.readFileSync(path.join(__dirname, 'cart.json'));
        return JSON.parse(data);
    }
    return [];
}

// Write cart data to JSON
function writeCart(cart) {
    fs.writeFileSync(path.join(__dirname, 'cart.json'), JSON.stringify(cart, null, 2));
}

// Serve the products
app.get('/api/products', (req, res) => {
    const products = readProducts();
    res.json(products);
});

// Add product dynamically (POST endpoint)
app.post('/api/products', (req, res) => {
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'Product name and price are required' });
    }

    const newProduct = { id: Date.now(), name, price };
    addProduct(newProduct);
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
});

// Add to cart
app.post('/api/cart', (req, res) => {
    const { id, quantity } = req.body;
    const products = readProducts();
    const product = products.find(p => p.id === id);

    if (product) {
        const cart = readCart();
        const existingProduct = cart.find(item => item.id === id);
        
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        
        writeCart(cart);
        res.json({ message: 'Product added to cart', cart });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// Get the cart
app.get('/api/cart', (req, res) => {
    const cart = readCart();
    res.json(cart);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
