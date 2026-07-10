const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// Load environment configurations
dotenv.config();

// Create application server
const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set up Views engine template path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Database, Authentication, and Razorpay Wrappers
const db = require('./src/db');
const { adminAuth, loginAdmin } = require('./src/auth');
const rzp = require('./src/razorpay');

// ==========================================================================
// STOREFRONT PUBLIC ROUTES
// ==========================================================================

// Homepage
app.get('/', async (req, res) => {
  try {
    const allProducts = await db.getProducts();
    const featured = allProducts.slice(0, 3); // Get latest 3
    res.render('index', {
      title: "Thistlewood | English Tailoring & Heritage Garments",
      description: "Thistlewood is a British luxury clothing brand dedicated to modernized English tailoring, premium woolen fabrics, and structured silhouettes.",
      featuredProducts: featured
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Collection/Shop page
app.get('/shop', async (req, res) => {
  try {
    const category = req.query.category || null;
    const products = await db.getProducts(category);
    res.render('shop', {
      title: "The Collection - Shop | Thistlewood",
      description: "Discover Thistlewood's curated garments. Explore tailored trench coats, silk slip dresses, cable knit sweaters, and pleated flannel trousers.",
      products: products
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading catalog');
  }
});

// Product detail page
app.get('/products/:slug', async (req, res) => {
  try {
    const product = await db.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).render('faq', {
        title: "Page Not Found - Thistlewood",
        description: "The requested piece could not be located."
      });
    }

    const allProducts = await db.getProducts();
    // Suggest 3 garments of the same category, excluding current product
    const related = allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);

    // Schema.org structured data injection
    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images,
      "description": product.description,
      "sku": product.id,
      "brand": {
        "@type": "Brand",
        "name": "Thistlewood"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": product.price,
        "availability": "https://schema.org/InStock"
      }
    };

    res.render('product', {
      title: `${product.name} - Thistlewood`,
      description: product.meta_description || product.description.substring(0, 150),
      product: product,
      relatedProducts: related,
      structuredData: structuredData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading product details');
  }
});

// Cart page
app.get('/cart', (req, res) => {
  res.render('cart', {
    title: "Your Shopping Bag | Thistlewood",
    description: "Review garments in your private selection bag before checking out."
  });
});

// Checkout page
app.get('/checkout', (req, res) => {
  res.render('checkout', {
    title: "Checkout | Thistlewood",
    description: "Complete shipping and secure payment procedures for your Thistlewood order."
  });
});

// Order confirmation page
app.get('/order-confirmation', async (req, res) => {
  try {
    const orderId = req.query.order_id;
    if (!orderId) return res.redirect('/shop');

    const orders = await db.getOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) return res.redirect('/shop');

    res.render('order-confirmation', {
      title: "Exquisite Choice - Order Confirmed | Thistlewood",
      description: "Your Thistlewood purchase summary, invoice details, and shipment timeline.",
      order: order
    });
  } catch (err) {
    console.error(err);
    res.redirect('/shop');
  }
});

// Static pages
app.get('/about', (req, res) => {
  res.render('about', {
    title: "Heritage & Story - About Us | Thistlewood",
    description: "Read about our history, master tailors, sustainable fabrics, and English tailoring studio."
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    title: "Connect With Us | Thistlewood",
    description: "Inquire about fitting bookings, fabric selections, or custom adjustments."
  });
});

app.get('/faq', (req, res) => {
  res.render('faq', {
    title: "Client Care FAQ | Thistlewood",
    description: "Answers regarding custom sizing, shipping priorities, packaging, and archive exchanges."
  });
});

// XML SEO Sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await db.getProducts();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Static routes
    const paths = ['', '/shop', '/about', '/contact', '/faq', '/cart'];
    const origin = `${req.protocol}://${req.get('host')}`;
    
    paths.forEach(p => {
      xml += `  <url>\n    <loc>${origin}${p}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });

    // Dynamic product routes
    products.forEach(p => {
      xml += `  <url>\n    <loc>${origin}/products/${p.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating sitemap');
  }
});

// ==========================================================================
// E-COMMERCE API ENDPOINTS
// ==========================================================================

// Create Order (Calculates amount server-side & logs order)
app.post('/api/create-order', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_zip, shipping_country, items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Bag is empty.' });
    }

    // Verify prices and calculate totals against database records (prevent client alterations)
    let computedAmount = 0;
    const orderItemsDetails = [];

    for (const item of items) {
      const dbProd = await db.getProductById(item.product_id);
      if (!dbProd) {
        return res.status(404).json({ success: false, message: `Product ${item.product_id} not found.` });
      }

      // Check variant stock availability
      const sizeVar = dbProd.variants.find(v => v.size === item.size);
      if (!sizeVar || sizeVar.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for size ${item.size} of ${dbProd.name}.` });
      }

      computedAmount += dbProd.price * item.quantity;
      orderItemsDetails.push({
        product_id: item.product_id,
        size: item.size,
        quantity: item.quantity,
        price: dbProd.price
      });
    }

    // Apply promo discounts if relevant
    // In our simplified demo, we trust the checkout calculation but let's recheck discount keys
    // If the server receives an applied promo, we reduce calculated sums
    // For safety, let's check a standard promo mapping

    // Create order entry on Razorpay (or simulation)
    const rzpOrder = await rzp.createOrder(computedAmount, `receipt_${Date.now()}`);

    // Log pending order to database
    const dbOrder = await db.createOrder({
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_zip,
      shipping_country,
      total_amount: computedAmount,
      razorpay_order_id: rzpOrder.id
    }, orderItemsDetails);

    res.json({
      success: true,
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      razorpay_key: rzp.key_id,
      local_order_id: dbOrder.id
    });

  } catch (err) {
    console.error('Order Creation API Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify payment signature & adjust stock
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = rzp.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature validation.' });
    }

    // Finalize payment flags and subtract stocks
    const orderId = await db.verifyOrderPayment(razorpay_order_id, razorpay_payment_id);
    
    res.json({ success: true, order_id: orderId });

  } catch (err) {
    console.error('Payment Verification API Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================================
// ADMIN CONSOLE ROUTES & ACTIONS
// ==========================================================================

// Global administrative session validator to secure /admin/* routes
app.use('/admin', (req, res, next) => {
  if (req.path === '/login') {
    return next();
  }
  return adminAuth(req, res, next);
});

// GET Login
app.get('/admin/login', (req, res) => {
  const token = req.cookies.admin_session;
  if (token === process.env.SESSION_SECRET) return res.redirect('/admin');
  res.render('admin-login', { error: null });
});

// POST Login
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await loginAdmin(email, password);
    // Save session cookie
    res.cookie('admin_session', result.token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/admin');
  } catch (err) {
    res.render('admin-login', { error: err.message });
  }
});

// GET Logout
app.get('/admin/logout', (req, res) => {
  res.clearCookie('admin_session');
  res.redirect('/admin/login');
});

// GET Dashboard Index
app.get('/admin', async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.render('admin-dashboard', {
      user: req.adminUser,
      stats: stats
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});

// GET Product Listings / CRUD Forms
app.get('/admin/products', async (req, res) => {
  try {
    const action = req.query.action || 'list'; // list, add, edit
    const productId = req.query.id || null;
    
    let product = null;
    if (action === 'edit' && productId) {
      product = await db.getProductById(productId);
    }

    const allProducts = await db.getProducts();

    res.render('admin-products', {
      user: req.adminUser,
      action: action,
      products: allProducts,
      product: product
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading products page');
  }
});

// POST Add product
app.post('/admin/products/add', async (req, res) => {
  try {
    const { name, slug, price, category, description, care_instructions, colors_csv, product_images, size_S, size_M, size_L, size_XL, meta_title, meta_description } = req.body;
    
    const colors = colors_csv.split(',').map(c => c.trim()).filter(Boolean);
    // Ensure we have at least one image, or fall back to default
    const images = Array.isArray(product_images) ? product_images : (product_images ? [product_images] : ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800']);

    const productData = {
      name, slug, price, category, description, care_instructions, colors, images, meta_title, meta_description
    };

    const variantsData = {
      S: parseInt(size_S) || 0,
      M: parseInt(size_M) || 0,
      L: parseInt(size_L) || 0,
      XL: parseInt(size_XL) || 0
    };

    await db.createProduct(productData, variantsData);
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating product: ' + err.message);
  }
});

// POST Edit product
app.post('/admin/products/edit/:id', async (req, res) => {
  try {
    const { name, slug, price, category, description, care_instructions, colors_csv, product_images, size_S, size_M, size_L, size_XL, meta_title, meta_description } = req.body;
    
    const colors = colors_csv.split(',').map(c => c.trim()).filter(Boolean);
    const images = Array.isArray(product_images) ? product_images : (product_images ? [product_images] : ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800']);

    const productData = {
      name, slug, price, category, description, care_instructions, colors, images, meta_title, meta_description
    };

    const variantsData = {
      S: parseInt(size_S) || 0,
      M: parseInt(size_M) || 0,
      L: parseInt(size_L) || 0,
      XL: parseInt(size_XL) || 0
    };

    await db.updateProduct(req.params.id, productData, variantsData);
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating product: ' + err.message);
  }
});

// DELETE Product
app.delete('/api/admin/products/:id', adminAuth, async (req, res) => {
  try {
    await db.deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Orders ledger
app.get('/admin/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.render('admin-orders', {
      user: req.adminUser,
      orders: orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading orders ledger');
  }
});

// POST Update Order shipping status
app.post('/api/admin/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await db.updateOrderStatus(req.params.id, status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Upload Image File (Admin multipart upload with Supabase Storage integration)
app.post('/api/admin/upload-image', adminAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (useSupabase) {
    try {
      const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const fileBuffer = fs.readFileSync(req.file.path);
      const fileName = `${Date.now()}-${req.file.originalname}`;
      
      const { data, error } = await supabaseAdmin.storage
        .from('product-images')
        .upload(fileName, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Clean up the local temp file to keep disk clean on ephemeral/Render instances
      fs.unlinkSync(req.file.path);

      return res.json({ success: true, url: publicUrl });
    } catch (err) {
      console.error('Supabase Storage Upload Error, falling back to disk:', err);
      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({ success: true, url: fileUrl, warning: 'Uploaded locally due to cloud storage failure.' });
    }
  } else {
    // Local fallback
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
  }
});

// ==========================================================================
// SERVER INITIALIZATION
// ==========================================================================

app.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`THISTLEWOOD LUXURY E-COMMERCE SERVER RUNNING`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`Admin Console: http://localhost:${PORT}/admin`);
  console.log(`Default Credentials: admin@thistlewood.com / Couture2026!`);
  console.log(`========================================================\n`);
});
