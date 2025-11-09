const express = require("express");
const path = require("path");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const bookRoutes = require("./src/routes/bookRoutes");
const memberRoutes = require("./src/routes/memberRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'default-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            secure: process.env.NODE_ENV === 'production', // Secure cookies di production (HTTPS)
            httpOnly: true,
            sameSite: 'lax'
        },
    })
);

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.use("/", authRoutes);
app.use("/admin/books", bookRoutes);
app.use("/", memberRoutes);
app.use("/admin", adminRoutes);


app.get("/", (req, res) => {
    if (req.session.isLoggedIn) {
        if (req.session.user.role === "admin") {
            return res.redirect("/admin/books");
        }
        return res.redirect("/katalog");
    }
    res.redirect("/login");
});

app.get("/books", (req, res) => {
    res.redirect("/katalog");
});

app.use("/member", memberRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    
    // Jika request mengharapkan JSON (API)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(err.status || 500).json({
            error: process.env.NODE_ENV === 'production' 
                ? 'Internal Server Error' 
                : err.message
        });
    }
    
    // Untuk EJS views, redirect ke login dengan error message di session
    req.session.error = process.env.NODE_ENV === 'production' 
        ? 'Terjadi kesalahan pada server' 
        : err.message;
    res.redirect('/login');
});

// 404 handler
app.use((req, res) => {
    // Jika request mengharapkan JSON (API)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(404).json({ error: 'Not Found' });
    }
    
    // Untuk EJS views, redirect ke halaman utama atau tampilkan 404
    res.status(404).redirect('/');
});

// Untuk Vercel, export app sebagai module (Vercel akan handle server)
// Untuk development lokal, tetap bisa menggunakan app.listen
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;
