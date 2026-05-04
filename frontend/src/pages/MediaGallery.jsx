import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MediaGallery() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxItem, setLightboxItem] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        axios.get('/api/media')
            .then(res => setMedia(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? media : media.filter(m => m.media_type === filter);

    if (loading) return <div className="loading"><div className="spinner"></div><p>Yükleniyor...</p></div>;

    return (
        <div className="page">
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">Medya Galerisi</h1>
                </div>

                {/* Filter Buttons */}
                {media.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        {[
                            { key: 'all', label: 'Tümü' },
                            { key: 'image', label: 'Fotoğraflar' },
                            { key: 'video', label: 'Videolar' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: filter === f.key ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                    background: filter === f.key ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                                    color: filter === f.key ? '#fff' : 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: filter === f.key ? '600' : '400',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}

                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"></div>
                        <h3>Henüz medya eklenmemiş</h3>
                        <p>Fotoğraf ve videolar yakında eklenecektir.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {filtered.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setLightboxItem(item)}
                                style={{
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                    border: '1px solid var(--color-border)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    background: 'var(--color-bg-secondary)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {item.media_type === 'video' ? (
                                    <div style={{ position: 'relative' }}>
                                        <video
                                            src={item.file_path}
                                            style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                                        />
                                        <div style={{
                                            position: 'absolute', top: '50%', left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '56px', height: '56px', borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.6)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', color: '#fff',
                                            backdropFilter: 'blur(4px)'
                                        }}>▶</div>
                                        <span style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: 'rgba(0,0,0,0.6)', color: '#fff',
                                            padding: '3px 10px', borderRadius: '12px',
                                            fontSize: '0.75rem', fontWeight: '600'
                                        }}>Video</span>
                                    </div>
                                ) : (
                                    <img
                                        src={item.file_path}
                                        alt={item.caption || 'Medya'}
                                        style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                                    />
                                )}
                                {item.caption && (
                                    <div style={{
                                        padding: '12px 14px',
                                        color: 'var(--color-text-secondary)',
                                        fontSize: '0.9rem',
                                        borderTop: '1px solid var(--color-border)'
                                    }}>
                                        {item.caption}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Lightbox */}
                {lightboxItem && (
                    <div
                        className="lightbox-overlay"
                        onClick={() => setLightboxItem(null)}
                    >
                        <button className="lightbox-close" onClick={() => setLightboxItem(null)}>✕</button>
                        <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh' }}>
                            {lightboxItem.media_type === 'video' ? (
                                <video
                                    src={lightboxItem.file_path}
                                    controls
                                    autoPlay
                                    style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '8px' }}
                                />
                            ) : (
                                <img
                                    src={lightboxItem.file_path}
                                    alt={lightboxItem.caption || ''}
                                    style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '8px' }}
                                />
                            )}
                            {lightboxItem.caption && (
                                <p style={{
                                    color: '#fff', textAlign: 'center',
                                    marginTop: '12px', fontSize: '1rem'
                                }}>
                                    {lightboxItem.caption}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
