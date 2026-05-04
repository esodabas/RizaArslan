import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function ColumnDetail() {
    const { id } = useParams();
    const [column, setColumn] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/columns/${id}`)
            .then(res => setColumn(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) return <div className="loading"><div className="spinner"></div><p>Yükleniyor...</p></div>;
    if (!column) return <div className="empty-state"><h3>Yazı bulunamadı</h3><Link to="/bireysel-gorusler">← Bireysel Görüşlere Dön</Link></div>;

    let mediaItems = [];
    try { mediaItems = column.media ? JSON.parse(column.media) : []; } catch (e) { mediaItems = []; }

    return (
        <div className="detail-page">
            <Link to="/bireysel-gorusler" className="detail-back">← Bireysel Görüşlere Dön</Link>

            <h1 className="detail-title">{column.title}</h1>

            <div className="detail-meta">
                <span>{formatDate(column.created_at)}</span>
                {column.updated_at !== column.created_at && (
                    <span>Güncelleme: {formatDate(column.updated_at)}</span>
                )}
            </div>

            <div className="detail-content" dangerouslySetInnerHTML={{ __html: column.content }} />

            {/* Media Gallery */}
            {mediaItems.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ color: 'var(--color-text)', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Görsel ve Videolar</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {mediaItems.map((item, index) => (
                            <div key={index} style={{
                                borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-bg-secondary)'
                            }}>
                                {item.type === 'video' ? (
                                    <video
                                        src={item.url}
                                        controls
                                        style={{ width: '100%', display: 'block' }}
                                    />
                                ) : (
                                    <img
                                        src={item.url}
                                        alt={item.caption || `Medya ${index + 1}`}
                                        style={{ width: '100%', display: 'block' }}
                                    />
                                )}
                                {item.caption && (
                                    <p style={{ padding: '10px', color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>{item.caption}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
