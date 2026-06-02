const express = require('express');
const router = express.Router();
const { queryAll, queryGet, runSql } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/articles
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let articles;

        if (status === 'all') {
            articles = await queryAll('SELECT id, title, summary, cover_image, file_path, status, created_at, updated_at FROM articles ORDER BY created_at DESC');
        } else {
            articles = await queryAll("SELECT id, title, summary, cover_image, file_path, status, created_at, updated_at FROM articles WHERE status = 'published' ORDER BY created_at DESC");
        }

        res.json(articles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
    try {
        const article = await queryGet('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        if (!article) return res.status(404).json({ error: 'Makale bulunamadı' });
        res.json(article);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/articles
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content, summary, cover_image, file_path, status } = req.body;
        const result = await runSql(
            'INSERT INTO articles (title, content, summary, cover_image, file_path, status) VALUES (?, ?, ?, ?, ?, ?)',
            [title || '', content || '', summary || '', cover_image || '', file_path || '', status || 'draft']
        );
        console.log('INSERT result:', JSON.stringify(result));
        const article = await queryGet('SELECT * FROM articles WHERE id = ?', [result.lastInsertRowid]);
        console.log('queryGet result:', article ? 'found article id=' + article.id : 'NULL');
        res.status(201).json(article);
    } catch (err) {
        console.error('POST /api/articles error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// PUT /api/articles/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, content, summary, cover_image, file_path, status } = req.body;
        const existing = await queryGet('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Makale bulunamadı' });

        await runSql(
            'UPDATE articles SET title = ?, content = ?, summary = ?, cover_image = ?, file_path = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [
                title !== undefined ? title : existing.title,
                content !== undefined ? content : existing.content,
                summary !== undefined ? summary : existing.summary,
                cover_image !== undefined ? cover_image : existing.cover_image,
                file_path !== undefined ? file_path : existing.file_path,
                status !== undefined ? status : existing.status,
                req.params.id
            ]
        );

        const article = await queryGet('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        res.json(article);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// DELETE /api/articles/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const existing = await queryGet('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Makale bulunamadı' });
        await runSql('DELETE FROM articles WHERE id = ?', [req.params.id]);
        res.json({ message: 'Makale silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
