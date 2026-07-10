const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;
let jsonDbPath = path.resolve(__dirname, '../thistlewood_db.json');

if (useSupabase) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Database Service: Using Supabase connection.');
} else {
    console.log(`Database Service: Using local JSON database at: ${jsonDbPath}`);
    initializeJSONDatabase();
}

// ----------------------------------------------------
// LOCAL JSON DATABASE INITIALIZATION & SEEDING
// ----------------------------------------------------
function readJSONDb() {
    try {
        if (!fs.existsSync(jsonDbPath)) {
            initializeJSONDatabase();
        }
        const data = fs.readFileSync(jsonDbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading JSON database:', err);
        return { products: [], product_variants: [], orders: [], order_items: [] };
    }
}

function writeJSONDb(data) {
    try {
        fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing to JSON database:', err);
    }
}

function initializeJSONDatabase() {
    if (fs.existsSync(jsonDbPath)) {
        return;
    }

    const defaultDb = {
        products: [
            {
                id: 'prod_1',
                name: "The Gladstone Tweed Blazer",
                slug: 'gladstone-tweed-blazer',
                description: 'A structured, single-breasted blazer tailored from heavy Yorkshire tweed wool. Designed with high armholes, clean canvased front chests, and dual rear vents reflecting classical English field jackets. Modernized through a sharp, contemporary silhouette.',
                care_instructions: 'Professional dry clean only. Brush down with a soft clothes brush to clean. Store in a cool, dry wardrobe on a structured oak hanger.',
                price: 1450.00,
                category: 'Outerwear',
                colors: ['Heather', 'Forest Green'],
                images: [
                    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop'
                ],
                meta_title: "The Gladstone Tweed Blazer - Thistlewood",
                meta_description: 'A tailored single-breasted tweed jacket crafted from heavy Yorkshire wool. Features modern English lines.'
            },
            {
                id: 'prod_2',
                name: 'The Heather Slip Dress',
                slug: 'heather-slip-dress',
                description: 'An elegant bias-cut dress crafted from heavy sand-washed silk. Featuring an understated cowl neck and a deep cowl back. Inspired by wild heather fields in Scotland, dyed a deep thistle-mauve color.',
                care_instructions: 'Dry clean only. Steam gently. Do not wring or tumble dry.',
                price: 890.00,
                category: 'Dresses',
                colors: ['Heather', 'Deep Burgundy'],
                images: [
                    'https://images.unsplash.com/photo-1539008885128-40d24f3b8015?q=80&w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop'
                ],
                meta_title: 'The Heather Silk Slip Dress - Thistlewood',
                meta_description: 'Discover the Heather silk slip dress. Bias-cut styling with signature cowl detail in thistle-mauve.'
            },
            {
                id: 'prod_3',
                name: "The Shetland Cable Sweater",
                slug: 'shetland-cable-sweater',
                description: 'A thick, traditional cable-knit sweater made from un-dyed Shetland wool. Features a rugged crew neck, drop shoulders, and organic ribbed hems. Designed for a comfortable fit that provides exceptional warmth.',
                care_instructions: 'Hand wash cold with wool detergent. Dry flat. Never hang while wet.',
                price: 680.00,
                category: 'Knitwear',
                colors: ['Bone', 'Bottle Green'],
                images: [
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop'
                ],
                meta_title: "The Shetland Cable Sweater - Thistlewood",
                meta_description: 'Traditional cable-knit crewneck sweater crafted from un-dyed Shetland wool.'
            },
            {
                id: 'prod_4',
                name: 'The Savile Pleated Trouser',
                slug: 'savile-pleated-trouser',
                description: 'High-rise pleated trousers tailored in heavy wool flannel from English mills. Cut with a fluid wide leg, adjustable side tabs, double pleats, and a classic cuffed hem for a clean, sharp break.',
                care_instructions: 'Professional dry clean only. Steam or press with a damp pressing cloth.',
                price: 750.00,
                category: 'Trousers',
                colors: ['Charcoal', 'Bone'],
                images: [
                    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop'
                ],
                meta_title: 'The Savile Pleated Flannel Trouser - Thistlewood',
                meta_description: 'Tailored high-rise double-pleated flannel trousers with side adjustments and cuffed hems.'
            },
            {
                id: 'prod_5',
                name: 'The Yorkshire Storm Coat',
                slug: 'yorkshire-storm-coat',
                description: 'A double-breasted heavy trench coat tailored from water-repellent English gabardine wool. Features structural storm flaps, hand-sewn buttonholes, horn buttons, and a belted waist. Built to withstand elements with uncompromising sophistication.',
                care_instructions: 'Dry clean only. Hang on a wide hanger in a breathable garment bag.',
                price: 1950.00,
                category: 'Outerwear',
                colors: ['Bottle Green', 'Charcoal'],
                images: [
                    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop'
                ],
                meta_title: 'The Yorkshire Storm Wool Trench Coat - Thistlewood',
                meta_description: 'A double-breasted gabardine wool storm coat with protective storm flaps.'
            },
            {
                id: 'prod_6',
                name: 'The Wessex Linen Shirt',
                slug: 'wessex-linen-shirt',
                description: 'A minimalist band-collar shirt cut from organic Irish linen. Features a button-through front with mother-of-pearl buttons, a single chest pocket, and clean French seams. Soft, breathable, and structured.',
                care_instructions: 'Wash cold on gentle cycle. Hang to dry. Iron damp for a crisp look, or wear wrinkled for character.',
                price: 420.00,
                category: 'Tops',
                colors: ['Pearl White', 'Deep Burgundy'],
                images: [
                    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1200&auto=format&fit=crop'
                ],
                meta_title: 'The Wessex Linen Shirt - Thistlewood',
                meta_description: 'Classic band-collar Irish linen shirt with French seams and mother-of-pearl buttons.'
            }
        ],
        product_variants: [],
        orders: [],
        order_items: []
    };

    // Populate variants
    for (const prod of defaultDb.products) {
        defaultDb.product_variants.push(
            { id: `${prod.id}_S`, product_id: prod.id, size: 'S', stock: 12 },
            { id: `${prod.id}_M`, product_id: prod.id, size: 'M', stock: 8 },
            { id: `${prod.id}_L`, product_id: prod.id, size: 'L', stock: 5 },
            { id: `${prod.id}_XL`, product_id: prod.id, size: 'XL', stock: 2 }
        );
    }

    writeJSONDb(defaultDb);
    console.log('Database Service: Initial seed data written to thistlewood_db.json.');
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ----------------------------------------------------
// DATABASE ADAPTER INTERFACE
// ----------------------------------------------------

module.exports = {
    // Retrieve all products
    async getProducts(category = null) {
        if (useSupabase) {
            let query = supabase.from('products').select('*, product_variants(*)');
            if (category) {
                query = query.eq('category', category);
            }
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            
            return data.map(p => {
                p.variants = p.product_variants || [];
                return p;
            });
        } else {
            const db = readJSONDb();
            let list = db.products;
            if (category) {
                list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
            }
            // Populate variants for each product
            const populated = list.map(p => {
                const variants = db.product_variants.filter(v => v.product_id === p.id);
                return {
                    ...p,
                    variants
                };
            });
            // Sort by created_at desc
            return populated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    // Retrieve a product by its SEO slug (with variants)
    async getProductBySlug(slug) {
        if (useSupabase) {
            const { data: product, error: pErr } = await supabase.from('products').select('*').eq('slug', slug).single();
            if (pErr) return null;

            const { data: variants, error: vErr } = await supabase.from('product_variants').select('*').eq('product_id', product.id);
            if (vErr) throw vErr;

            product.variants = variants;
            return product;
        } else {
            const db = readJSONDb();
            const product = db.products.find(p => p.slug === slug);
            if (!product) return null;

            const variants = db.product_variants.filter(v => v.product_id === product.id);
            return {
                ...product,
                variants
            };
        }
    },

    // Retrieve product by ID
    async getProductById(id) {
        if (useSupabase) {
            const { data: product, error: pErr } = await supabase.from('products').select('*').eq('id', id).single();
            if (pErr) return null;

            const { data: variants, error: vErr } = await supabase.from('product_variants').select('*').eq('product_id', id);
            if (vErr) throw vErr;

            product.variants = variants;
            return product;
        } else {
            const db = readJSONDb();
            const product = db.products.find(p => p.id === id);
            if (!product) return null;

            const variants = db.product_variants.filter(v => v.product_id === id);
            return {
                ...product,
                variants
            };
        }
    },

    // Add a new product (Admin CRUD)
    async createProduct(productData, variantsData) {
        if (useSupabase) {
            const colors = productData.colors || [];
            const images = productData.images || [];

            const { data: product, error: pErr } = await supabase.from('products').insert([{
                name: productData.name,
                slug: productData.slug,
                description: productData.description,
                care_instructions: productData.care_instructions,
                price: parseFloat(productData.price),
                category: productData.category,
                colors: colors,
                images: images,
                meta_title: productData.meta_title || productData.name,
                meta_description: productData.meta_description || ''
            }]).select().single();

            if (pErr) throw pErr;

            const varsToInsert = Object.keys(variantsData).map(size => ({
                product_id: product.id,
                size: size,
                stock: parseInt(variantsData[size]) || 0
            }));

            const { error: vErr } = await supabase.from('product_variants').insert(varsToInsert);
            if (vErr) throw vErr;

            return product;
        } else {
            const db = readJSONDb();
            const prodId = 'prod_' + Date.now();
            const newProduct = {
                id: prodId,
                name: productData.name,
                slug: productData.slug,
                description: productData.description,
                care_instructions: productData.care_instructions,
                price: parseFloat(productData.price),
                category: productData.category,
                colors: productData.colors || [],
                images: productData.images || [],
                meta_title: productData.meta_title || productData.name,
                meta_description: productData.meta_description || '',
                created_at: new Date().toISOString()
            };

            db.products.push(newProduct);

            for (const size of Object.keys(variantsData)) {
                db.product_variants.push({
                    id: `${prodId}_${size}`,
                    product_id: prodId,
                    size: size,
                    stock: parseInt(variantsData[size]) || 0
                });
            }

            writeJSONDb(db);
            return newProduct;
        }
    },

    // Edit an existing product (Admin CRUD)
    async updateProduct(id, productData, variantsData) {
        if (useSupabase) {
            const colors = productData.colors || [];
            const images = productData.images || [];

            const { error: pErr } = await supabase.from('products').update({
                name: productData.name,
                slug: productData.slug,
                description: productData.description,
                care_instructions: productData.care_instructions,
                price: parseFloat(productData.price),
                category: productData.category,
                colors: colors,
                images: images,
                meta_title: productData.meta_title,
                meta_description: productData.meta_description
            }).eq('id', id);

            if (pErr) throw pErr;

            const { error: dErr } = await supabase.from('product_variants').delete().eq('product_id', id);
            if (dErr) throw dErr;

            const varsToInsert = Object.keys(variantsData).map(size => ({
                product_id: id,
                size: size,
                stock: parseInt(variantsData[size]) || 0
            }));

            const { error: vErr } = await supabase.from('product_variants').insert(varsToInsert);
            if (vErr) throw vErr;

            return true;
        } else {
            const db = readJSONDb();
            const pIndex = db.products.findIndex(p => p.id === id);
            if (pIndex === -1) throw new Error('Product not found');

            db.products[pIndex] = {
                ...db.products[pIndex],
                name: productData.name,
                slug: productData.slug,
                description: productData.description,
                care_instructions: productData.care_instructions,
                price: parseFloat(productData.price),
                category: productData.category,
                colors: productData.colors || [],
                images: productData.images || [],
                meta_title: productData.meta_title,
                meta_description: productData.meta_description
            };

            // Remove existing variants for this product
            db.product_variants = db.product_variants.filter(v => v.product_id !== id);

            // Add new ones
            for (const size of Object.keys(variantsData)) {
                db.product_variants.push({
                    id: `${id}_${size}_${Date.now()}`,
                    product_id: id,
                    size: size,
                    stock: parseInt(variantsData[size]) || 0
                });
            }

            writeJSONDb(db);
            return true;
        }
    },

    // Delete a product (Admin CRUD)
    async deleteProduct(id) {
        if (useSupabase) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const db = readJSONDb();
            db.products = db.products.filter(p => p.id !== id);
            db.product_variants = db.product_variants.filter(v => v.product_id !== id);
            writeJSONDb(db);
            return true;
        }
    },

    // Create a new pending order
    async createOrder(orderData, itemsData) {
        if (useSupabase) {
            const { data: order, error: oErr } = await supabase.from('orders').insert([{
                customer_name: orderData.customer_name,
                customer_email: orderData.customer_email,
                customer_phone: orderData.customer_phone,
                shipping_address: orderData.shipping_address,
                shipping_city: orderData.shipping_city,
                shipping_zip: orderData.shipping_zip,
                shipping_country: orderData.shipping_country,
                total_amount: parseFloat(orderData.total_amount),
                razorpay_order_id: orderData.razorpay_order_id,
                payment_status: 'pending',
                order_status: 'Pending'
            }]).select().single();

            if (oErr) throw oErr;

            const itemsToInsert = itemsData.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                size: item.size,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price)
            }));

            const { error: iErr } = await supabase.from('order_items').insert(itemsToInsert);
            if (iErr) throw iErr;

            return order;
        } else {
            const db = readJSONDb();
            const orderId = 'order_' + Date.now();
            const newOrder = {
                id: orderId,
                customer_name: orderData.customer_name,
                customer_email: orderData.customer_email,
                customer_phone: orderData.customer_phone,
                shipping_address: orderData.shipping_address,
                shipping_city: orderData.shipping_city,
                shipping_zip: orderData.shipping_zip,
                shipping_country: orderData.shipping_country,
                total_amount: parseFloat(orderData.total_amount),
                razorpay_order_id: orderData.razorpay_order_id,
                payment_status: 'pending',
                order_status: 'Pending',
                created_at: new Date().toISOString()
            };

            db.orders.push(newOrder);

            for (const item of itemsData) {
                db.order_items.push({
                    id: 'item_' + generateUUID(),
                    order_id: orderId,
                    product_id: item.product_id,
                    size: item.size,
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                });
            }

            writeJSONDb(db);
            return newOrder;
        }
    },

    // Verify and finalize payment, reduce inventories
    async verifyOrderPayment(razorpayOrderId, paymentId) {
        if (useSupabase) {
            const { data: order, error: oErr } = await supabase.from('orders').select('*').eq('razorpay_order_id', razorpayOrderId).single();
            if (oErr || !order) throw new Error('Order not found');

            const { error: uErr } = await supabase.from('orders').update({
                payment_status: 'paid',
                razorpay_payment_id: paymentId
            }).eq('id', order.id);
            if (uErr) throw uErr;

            const { data: items, error: iErr } = await supabase.from('order_items').select('*').eq('order_id', order.id);
            if (iErr) throw iErr;

            for (const item of items) {
                const { data: variant, error: vErr } = await supabase.from('product_variants')
                    .select('stock')
                    .eq('product_id', item.product_id)
                    .eq('size', item.size)
                    .single();
                
                if (!vErr && variant) {
                    const newStock = Math.max(0, variant.stock - item.quantity);
                    await supabase.from('product_variants')
                        .update({ stock: newStock })
                        .eq('product_id', item.product_id)
                        .eq('size', item.size);
                }
            }

            return order.id;
        } else {
            const db = readJSONDb();
            const order = db.orders.find(o => o.razorpay_order_id === razorpayOrderId);
            if (!order) throw new Error('Order not found');

            order.payment_status = 'paid';
            order.razorpay_payment_id = paymentId;

            // Reduce stock
            const items = db.order_items.filter(oi => oi.order_id === order.id);
            for (const item of items) {
                const variant = db.product_variants.find(pv => pv.product_id === item.product_id && pv.size === item.size);
                if (variant) {
                    variant.stock = Math.max(0, variant.stock - item.quantity);
                }
            }

            writeJSONDb(db);
            return order.id;
        }
    },

    // Retrieve all orders (Admin console)
    async getOrders() {
        if (useSupabase) {
            const { data: orders, error: oErr } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            if (oErr) throw oErr;

            for (const order of orders) {
                const { data: itemsRaw, error: rErr } = await supabase.from('order_items').select('*').eq('order_id', order.id);
                if (!rErr) {
                    for (const item of itemsRaw) {
                        const { data: prod } = await supabase.from('products').select('name').eq('id', item.product_id).single();
                        item.product_name = prod ? prod.name : 'Unknown Product';
                    }
                    order.items = itemsRaw;
                } else {
                    order.items = [];
                }
            }
            return orders;
        } else {
            const db = readJSONDb();
            const orders = [...db.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            return orders.map(order => {
                const items = db.order_items.filter(oi => oi.order_id === order.id).map(item => {
                    const prod = db.products.find(p => p.id === item.product_id);
                    return {
                        ...item,
                        product_name: prod ? prod.name : 'Unknown Product'
                    };
                });
                return {
                    ...order,
                    items
                };
            });
        }
    },

    // Update shipping status (Admin CRUD)
    async updateOrderStatus(orderId, status) {
        if (useSupabase) {
            const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
            if (error) throw error;
            return true;
        } else {
            const db = readJSONDb();
            const order = db.orders.find(o => o.id === orderId);
            if (!order) throw new Error('Order not found');

            order.order_status = status;
            writeJSONDb(db);
            return true;
        }
    },

    // Retrieve stats for Admin Dashboard
    async getDashboardStats() {
        if (useSupabase) {
            const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
            const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

            const { data: salesData } = await supabase.from('orders').select('total_amount').eq('payment_status', 'paid');
            const totalRevenue = (salesData || []).reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0);

            const { data: lowStock } = await supabase.from('product_variants')
                .select('product_id, size, stock, products(name)')
                .lt('stock', 5);
            
            const formattedLowStock = (lowStock || []).map(item => ({
                product_name: item.products ? item.products.name : 'Unknown Product',
                size: item.size,
                stock: item.stock
            }));

            const { data: recentOrders } = await supabase.from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            return {
                totalProducts: prodCount || 0,
                totalOrders: orderCount || 0,
                totalRevenue: totalRevenue || 0,
                lowStockAlerts: formattedLowStock,
                recentOrders: recentOrders || []
            };
        } else {
            const db = readJSONDb();
            
            const totalProducts = db.products.length;
            const totalOrders = db.orders.length;
            
            const paidOrders = db.orders.filter(o => o.payment_status === 'paid');
            const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total_amount, 0);

            const lowStockAlerts = db.product_variants.filter(pv => pv.stock < 5).map(pv => {
                const prod = db.products.find(p => p.id === pv.product_id);
                return {
                    product_name: prod ? prod.name : 'Unknown Product',
                    size: pv.size,
                    stock: pv.stock
                };
            });

            const recentOrders = [...db.orders]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);

            return {
                totalProducts,
                totalOrders,
                totalRevenue,
                lowStockAlerts,
                recentOrders
            };
        }
    }
};
