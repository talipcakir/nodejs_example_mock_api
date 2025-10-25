const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Swagger/OpenAPI için gerekli paketler
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); 

const app = express();
const port = 4000; 

// Swagger tanım dosyasını yükle
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// CORS ayarı
app.use(cors());

// İstek gövdesini (body) işlemek için ayarlar
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =========================================================================
// SWAGGER UI ENTEGRASYONU
// http://localhost:4000/api-docs adresinde Swagger arayüzü yayınlanacak
// =========================================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Mock veriyi belleğe yükle
let products = [];
try {
    const dataPath = path.join(__dirname, 'products.json');
    const rawData = fs.readFileSync(dataPath);
    products = JSON.parse(rawData);
    console.log(`Toplam ${products.length} ürün yüklendi.`);
} catch (error) {
    console.error("Hata: products.json dosyası yüklenemedi veya okunamadı.", error);
    process.exit(1); 
}

// =========================================================================
// 1. Çoklu Ürün Getirme (Liste, Limit, Filtreleme) Endpoint'i
// GET /products?_limit=8&category=Computers
// =========================================================================
app.get('/products', (req, res) => {
    let filteredProducts = [...products]; 

    // 1. Kategoriye Göre Filtreleme (Filtrasyon/Filtreleme Endpointi)
    const category = req.query.category;
    if (category) {
        filteredProducts = filteredProducts.filter(p => 
            p.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    // 2. Limit Uygulama (Sayfalama veya Ana Sayfa için)
    const limit = req.query._limit ? parseInt(req.query._limit) : 0;
    if (limit > 0) {
        filteredProducts = filteredProducts.slice(0, limit); 
    }
    
    // 3. Sıralama (Örnek olarak fiyata göre artan sıralama)
    filteredProducts.sort((a, b) => a.price - b.price);


    res.json(filteredProducts);
});


// =========================================================================
// 2. Tekli Ürün Getirme Endpoint'i
// GET /products/1
// =========================================================================
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: "Ürün bulunamadı." });
    }
});


// =========================================================================
// 3. POST Örneği Endpoint'i (Örn: Sipariş Oluşturma)
// POST /order
// =========================================================================
app.post('/order', (req, res) => {
    const orderData = req.body;

    if (!orderData || Object.keys(orderData).length === 0) {
        return res.status(400).json({ message: "Sipariş verisi boş olamaz." });
    }

    console.log("Yeni sipariş alındı:", orderData);
    
    res.status(201).json({ 
        success: true, 
        message: "Sipariş başarıyla oluşturuldu.",
        orderId: Math.floor(Math.random() * 100000) + 1,
        receivedData: orderData
    });
});






app.get('/category', (req, res) => {
    const categories = [...new Set(products.map(p => p.category))];
    res.json(categories);
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Express Mock Backend Sunucusu http://localhost:${port} adresinde çalışıyor.`);
    console.log(`Swagger Arayüzü: http://localhost:${port}/api-docs`);
});