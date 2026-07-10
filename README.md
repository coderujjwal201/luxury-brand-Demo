# Thistlewood — Luxury English Heritage Tailoring Portal

Thistlewood is a production-quality, responsive e-commerce web application for a luxury clothing brand rooted in modernized English tailoring heritage. It features a switchable dual-theme system, server-side dynamic page rendering (SEO-optimized), secure customer checkout flows, and a password-protected administrative console.

---

## 💎 Design Directions

Thistlewood features **two switchable UI themes** toggleable via the header control:
1.  **Option A: "Daylight" (Default Theme)**
    *   Aesthetics: Modernized English mill tailoring, warm stone background (`#EDE8DF`), soft Display serif typography (`Fraunces`), geometric UI copy (`Archivo`), generous margins, and asymmetric product catalog placement.
    *   Signature Interaction: A slow-scrolling horizontal Lookbook gallery displaying high-fashion collection graphics in a continuous loop.
2.  **Option B: "Evening"**
    *   Aesthetics: Moody evening-wear feel, deep bottle-green-black backdrop (`#14201A`), warm aged brass accents (`#B08D5C`), wide text tracking, and vignette photography filters.
    *   Signature Interaction: A real-time cursor-following spotlight magnifying lens that reveals high-resolution fabric texture details on the hero section.

---

## 🛠️ Technical Stack & Features

*   **Frontend:** HTML5 Semantics, Vanilla CSS (CSS Custom Properties), Vanilla JavaScript.
*   **Backend:** Node.js, Express Server.
*   **Template Engine:** EJS (Server-Side Rendering for dynamic metadata titles, descriptions, and structured schema data).
*   **Database:** Supabase PostgreSQL integration with a **zero-configuration pure-JS JSON file fallback (`maison_ether_db.json` / now re-seeded)** to ensure immediate local testing.
*   **Storage:** Direct file upload support to Supabase Storage buckets (saving public links to the database) with automatic local unlinking.
*   **Payments:** Razorpay Secure Checkout integration with support for local offline test simulations.
*   **SEO & Access:** Custom dynamic `sitemap.xml`, schema.org `Product` structured JSON-LD data, and strict keyboard focus accessibility patterns.

---

## 🚀 Quick Start (Local Run)

The application is structured to run immediately out-of-the-box using the local JSON database and test simulation modes.

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Server
To run the server in development watch mode:
```bash
npm run dev
```

Or start the production process:
```bash
npm run start
```

Once running, navigate your browser to:
*   Storefront: [http://localhost:3000](http://localhost:3000)
*   Admin Console: [http://localhost:3000/admin](http://localhost:3000/admin)

### 3. Admin Credentials
Log in to the protected admin dashboard using the default credentials:
*   **Email:** `admin@thistlewood.com`
*   **Password:** `Couture2026!`

---

## 🌐 Production Setup (Supabase & Razorpay)

To connect the application to your live Supabase database and Razorpay checkout gateway, create a `.env` file in the root directory (based on `.env.example`) and fill in the values:

### 1. Database Setup (Supabase)
Create a new project on [Supabase](https://supabase.com) and execute the SQL script below in the **Supabase SQL Editor**:

```sql
-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    care_instructions TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    colors TEXT[] NOT NULL,
    images TEXT[] NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create variants table (sizing and inventory stocks)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    UNIQUE(product_id, size)
);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_zip VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    razorpay_order_id VARCHAR(255) UNIQUE,
    razorpay_payment_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    size VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);
```

Add your Supabase credentials to `.env`:
```env
SUPABASE_URL=your_project_supabase_url
SUPABASE_ANON_KEY=your_project_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_project_service_role_key
```

Make sure to create a public storage bucket named `product-images` inside Supabase for product photograph uploads.

### 2. Payments Setup (Razorpay)
Sign up for a [Razorpay](https://razorpay.com) account and generate API Keys in **Test Mode**. Add these keys to your `.env` file:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

Once the environment variables are active, the application will automatically swap its database queries to Supabase, store images to cloud storage, and initialize Razorpay's overlay checkout screen during purchases!
