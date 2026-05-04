import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function GalleryManager() {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { navigate('/admin/login'); return; }
        loadGallery();
    }, [token, navigate]);

    const loadGallery = () => {
        axios.get('/api/upload/gallery').then(res => setImages(res.data)).catch(() => { });
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('gallery', 'true');
        formData.append('caption', caption);

        try {
            await axios.post('/api/upload', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setCaption('');
            loadGallery();
        } catch {
            alert('Yükleme hatası');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm('Bu görseli silmek istediğinize emin misiniz?')) return;

        try {
            await axios.delete(`/api/upload/gallery/${imageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImages(prev => prev.filter(img => img.id !== imageId));
        } catch {
            alert('Silme hatası');
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
                    <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>📸 Galeri Yönetimi</span>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 24px' }}>
                {/* Upload section */}
                <div style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    marginBottom: '30px'
                }}>
                    <h3 style={{ marginBottom: '16px' }}>Yeni Görsel Yükle</h3>
                    <div className="form-group">
                        <label className="form-label">Açıklama (isteğe bağlı)</label>
                        <input
                            className="form-input"
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="Görsel açıklaması..."
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input type="file" accept="image/*" onChange={handleUpload} />
                        {uploading && <span style={{ color: 'var(--color-warning)', fontSize: '0.85rem' }}>Yükleniyor...</span>}
                    </div>
                </div>

                {/* Gallery grid */}
                {images.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📸</div>
                        <h3>Henüz görsel eklenmemiş</h3>
                        <p>Yukarıdan ilk görselinizi yükleyin!</p>
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {images.map(image => (
                            <div key={image.id} style={{
                                position: 'relative',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                border: '1px solid var(--color-border)'
                            }}>
                                <img
                                    src={image.image_path}
                                    alt={image.caption || 'Galeri görseli'}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                />
                                <div style={{
                                    padding: '10px',
                                    background: 'var(--color-bg-card)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                        {image.caption || 'Açıklama yok'}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(image.id)}
                                        className="btn btn-sm btn-danger"
                                    >
                                        🗑️
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
