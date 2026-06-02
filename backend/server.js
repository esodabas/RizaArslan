require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - tüm originlere izin ver (Railway + lokal)
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Yüklenen dosyaları sun
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/books', require('./routes/books'));
app.use('/api/columns', require('./routes/columns'));
app.use('/api/about', require('./routes/about'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/media', require('./routes/media'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Rıza Arslan Blog API çalışıyor', env: process.env.NODE_ENV });
});

// Frontend (React/Vite) - production build'i sun
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

// React Router için - tüm GET isteklerini index.html'e yönlendir
app.get('*', (req, res) => {
    const indexPath = path.join(frontendBuildPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            // Frontend build yoksa basit mesaj göster
            res.json({ message: 'API çalışıyor', api: '/api/health' });
        }
    });
});

// Hata yakalama (multer dahil)
app.use((err, req, res, next) => {
    console.error('Sunucu hatası:', err.stack);

    // Multer hataları
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Dosya boyutu çok büyük' });
    }
    if (err.message && err.message.includes('dosya formatı')) {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Sunucu hatası', message: err.message });
});

// Veritabanını başlat, sunucuyu çalıştır
async function start() {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`\nSunucu calisiyor: http://localhost:${PORT}`);
            console.log(`API: http://localhost:${PORT}/api/health`);
            console.log(`ENV: ${process.env.NODE_ENV || 'development'}\n`);
        });
    } catch (err) {
        console.error('Sunucu baslatilamadi:', err.message);
        process.exit(1);
    }
}

start();
