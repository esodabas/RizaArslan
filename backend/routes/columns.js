const express = require('express');
const router = express.Router();
const { queryAll, queryGet, runSql } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/columns
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let columns;

        if (status === 'all') {
            columns = await queryAll('SELECT id, title, summary, status, created_at, updated_at FROM columns_table ORDER BY created_at DESC');
        } else {
            columns = await queryAll("SELECT id, title, summary, status, created_at, updated_at FROM columns_table WHERE status = 'published' ORDER BY created_at DESC");
        }

        res.json(columns);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// GET /api/columns/:id
router.get('/:id', async (req, res) => {
    try {
        const column = await queryGet('SELECT * FROM columns_table WHERE id = ?', [req.params.id]);
        if (!column) return res.status(404).json({ error: 'Bireysel görüş bulunamadı' });
        res.json(column);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// POST /api/columns
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content, summary, status, media } = req.body;
        const result = await runSql(
            'INSERT INTO columns_table (title, content, summary, status, media) VALUES (?, ?, ?, ?, ?)',
            [title || '', content || '', summary || '', status || 'draft', media || '[]']
        );
        const column = await queryGet('SELECT * FROM columns_table WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json(column);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// PUT /api/columns/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, content, summary, status, media } = req.body;
        const existing = await queryGet('SELECT * FROM columns_table WHERE id = ?', [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Bireysel görüş bulunamadı' });

        await runSql(
            'UPDATE columns_table SET title = ?, content = ?, summary = ?, status = ?, media = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [
                title !== undefined ? title : existing.title,
                content !== undefined ? content : existing.content,
                summary !== undefined ? summary : existing.summary,
                status !== undefined ? status : existing.status,
                media !== undefined ? media : (existing.media || '[]'),
                req.params.id
            ]
        );

        const column = await queryGet('SELECT * FROM columns_table WHERE id = ?', [req.params.id]);
        res.json(column);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// DELETE /api/columns/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const existing = await queryGet('SELECT * FROM columns_table WHERE id = ?', [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Bireysel görüş bulunamadı' });
        await runSql('DELETE FROM columns_table WHERE id = ?', [req.params.id]);
        res.json({ message: 'Bireysel görüş silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
