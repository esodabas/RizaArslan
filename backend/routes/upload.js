const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { queryAll, queryGet, runSql } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip', 'application/x-rar-compressed', 'application/vnd.rar'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Bu dosya formatı desteklenmiyor'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for videos
});

// POST /api/upload
router.post('/', authMiddleware, (req, res) => {
    upload.single('image')(req, res, async (multerErr) => {
        try {
            if (multerErr) {
                console.error('Multer hatası:', multerErr.message);
                if (multerErr.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'Dosya boyutu çok büyük (max 50MB)' });
                }
                return res.status(400).json({ error: multerErr.message || 'Dosya yükleme hatası' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'Dosya yüklenmedi' });
            }

            const imageUrl = `/uploads/${req.file.filename}`;

            if (req.body.gallery === 'true') {
                const maxOrder = await queryGet('SELECT MAX(sort_order) as max_order FROM gallery');
                const sortOrder = (maxOrder?.max_order || 0) + 1;
                await runSql('INSERT INTO gallery (image_path, caption, sort_order) VALUES (?, ?, ?)', [imageUrl, req.body.caption || '', sortOrder]);
            }

            res.json({ url: imageUrl, filename: req.file.filename });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Dosya yükleme hatası' });
        }
    });
});

// GET /api/upload/gallery
router.get('/gallery', async (req, res) => {
    try {
        const images = await queryAll('SELECT * FROM gallery ORDER BY sort_order ASC');
        res.json(images);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// DELETE /api/upload/gallery/:id
router.delete('/gallery/:id', authMiddleware, async (req, res) => {
    try {
        const image = await queryGet('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
        if (!image) return res.status(404).json({ error: 'Görsel bulunamadı' });

        const filePath = path.join(__dirname, '..', image.image_path);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (fileErr) {
            console.warn('Görsel diskten silinemedi (kullanımda olabilir):', fileErr.message);
        }

        await runSql('DELETE FROM gallery WHERE id = ?', [req.params.id]);
        res.json({ message: 'Görsel silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
