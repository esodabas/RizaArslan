import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function MediaManager() {
    const [media, setMedia] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editCaption, setEditCaption] = useState('');
    const navigate = useNavigate();
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        if (!getToken()) { navigate('/admin/login'); return; }
        loadMedia();
    }, [navigate]);

    const loadMedia = () => {
        axios.get('/api/media').then(res => setMedia(res.data)).catch(err => {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                navigate('/admin/login');
            }
        });
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('caption', caption);

                await axios.post('/api/media', formData, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
            }
            setCaption('');
            loadMedia();
        } catch {
            alert('Yükleme hatası');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu medyayı silmek istediğinize emin misiniz?')) return;

        try {
            await axios.delete(`/api/media/${id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setMedia(prev => prev.filter(m => m.id !== id));
        } catch {
            alert('Silme hatası');
        }
    };

    const handleUpdateCaption = async (id) => {
        try {
            await axios.put(`/api/media/${id}`, { caption: editCaption }, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setMedia(prev => prev.map(m => m.id === id ? { ...m, caption: editCaption } : m));
            setEditingId(null);
            setEditCaption('');
        } catch {
            alert('Güncelleme hatası');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <div style={{
                background: 'var(--color-bg-secondary)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/admin" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>← Panel</Link>
                    <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>Medya Yönetimi</span>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 24px' }}>
                {/* Upload section */}
                <div style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    marginBottom: '30px'
                }}>
                    <h3 style={{ marginBottom: '16px', color: 'var(--color-text)' }}>Yeni Medya Yükle</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Fotoğraf (JPEG, PNG, GIF, WebP) ve video (MP4, WebM, MOV) dosyaları yükleyebilirsiniz. Birden fazla dosya seçebilirsiniz.
                    </p>
                    <div className="form-group">
                        <label className="form-label">Açıklama (isteğe bağlı)</label>
                        <input
                            className="form-input"
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="Medya açıklaması..."
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input type="file" accept="image/*,video/*" multiple onChange={handleUpload} />
                        {uploading && <span style={{ color: 'var(--color-warning)', fontSize: '0.85rem' }}>Yükleniyor...</span>}
                    </div>
                </div>

                {/* Media grid */}
                {media.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"></div>
                        <h3>Henüz medya eklenmemiş</h3>
                        <p>Yukarıdan ilk fotoğraf veya videonuzu yükleyin!</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '16px'
                    }}>
                        {media.map(item => (
                            <div key={item.id} style={{
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-bg-secondary)'
                            }}>
                                {item.media_type === 'video' ? (
                                    <div style={{ position: 'relative' }}>
                                        <video
                                            src={item.file_path}
                                            style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                                        />
                                        <span style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            background: 'rgba(0,0,0,0.7)', color: '#fff',
                                            padding: '2px 8px', borderRadius: '8px',
                                            fontSize: '0.7rem', fontWeight: '600'
                                        }}>Video</span>
                                    </div>
                                ) : (
                                    <img
                                        src={item.file_path}
                                        alt={item.caption || 'Medya'}
                                        style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                                    />
                                )}

                                <div style={{ padding: '12px' }}>
                                    {editingId === item.id ? (
                                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                            <input
                                                type="text"
                                                value={editCaption}
                                                onChange={e => setEditCaption(e.target.value)}
                                                style={{
                                                    flex: 1, fontSize: '0.8rem', padding: '4px 8px',
                                                    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                                    borderRadius: '4px', color: 'var(--color-text)'
                                                }}
                                            />
                                            <button onClick={() => handleUpdateCaption(item.id)} className="btn btn-sm btn-primary" style={{ fontSize: '0.75rem' }}>Kaydet</button>
                                            <button onClick={() => setEditingId(null)} className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem' }}>İptal</button>
                                        </div>
                                    ) : (
                                        <p
                                            style={{
                                                fontSize: '0.85rem', color: 'var(--color-text-secondary)',
                                                marginBottom: '8px', cursor: 'pointer', minHeight: '20px'
                                            }}
                                            onClick={() => { setEditingId(item.id); setEditCaption(item.caption || ''); }}
                                            title="Düzenlemek için tıklayın"
                                        >
                                            {item.caption || 'Açıklama eklemek için tıklayın...'}
                                        </p>
                                    )}

                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="btn btn-sm btn-danger"
                                        style={{ width: '100%', fontSize: '0.8rem' }}
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
