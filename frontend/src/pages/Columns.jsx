import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Columns() {
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/columns')
            .then(res => setColumns(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) return <div className="loading"><div className="spinner"></div><p>Yükleniyor...</p></div>;

    return (
        <div className="page">
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">Bireysel Görüşler</h1>
                </div>

                {columns.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"></div>
                        <h3>Henüz bireysel görüş eklenmemiş</h3>
                        <p>Bireysel görüşler yakında eklenecektir.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {columns.map((col, index) => (
                            <Link
                                key={col.id}
                                to={`/bireysel-gorusler/${col.id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div
                                    style={{
                                        background: 'var(--color-bg-card, var(--color-bg-secondary))',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md, 12px)',
                                        padding: '24px 28px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                                        e.currentTarget.style.borderColor = 'var(--color-accent, #3b82f6)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = 'var(--color-border)';
                                    }}
                                >
                                    {/* Number badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '20px',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'var(--color-accent, #3b82f6)',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        opacity: 0.15,
                                        pointerEvents: 'none'
                                    }}>
                                        {index + 1}
                                    </div>

                                    {/* Date tag */}
                                    <div style={{
                                        display: 'inline-block',
                                        fontSize: '0.78rem',
                                        color: 'var(--color-accent, #3b82f6)',
                                        fontWeight: '600',
                                        marginBottom: '8px',
                                        letterSpacing: '0.3px',
                                    }}>
                                        {formatDate(col.created_at)}
                                    </div>

                                    {/* Title */}
                                    <h3 style={{
                                        margin: '0 0 10px 0',
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: 'var(--color-text)',
                                        fontFamily: 'var(--font-heading, inherit)',
                                        lineHeight: '1.4',
                                        paddingRight: '40px'
                                    }}>
                                        {col.title}
                                    </h3>

                                    {/* Summary */}
                                    {col.summary && (
                                        <p style={{
                                            margin: '0',
                                            fontSize: '0.95rem',
                                            color: 'var(--color-text-secondary)',
                                            lineHeight: '1.6',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {col.summary}
                                        </p>
                                    )}

                                    {/* Read more indicator */}
                                    <div style={{
                                        marginTop: '14px',
                                        fontSize: '0.85rem',
                                        color: 'var(--color-accent, #3b82f6)',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        Devamını oku →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
