import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Contact() {
    const [about, setAbout] = useState({});

    useEffect(() => {
        axios.get('/api/about').then(res => setAbout(res.data)).catch(() => { });
    }, []);

    return (
        <div className="page">
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">İletişim</h1>
                </div>

                <div className="contact-grid">
                    <div className="contact-info-card">
                        <h3>İletişim Bilgileri</h3>

                        <div className="contact-item">
                            <span className="contact-icon"></span>
                            <div>
                                <strong>{about.academic_title || 'Prof. Dr. rer. pol.'} {about.full_name || 'Rıza Arslan'}</strong>
                            </div>
                        </div>

                        {about.university && (
                            <div className="contact-item">
                                <span className="contact-icon"></span>
                                <div>{about.university}</div>
                            </div>
                        )}

                        {about.department && (
                            <div className="contact-item">
                                <span className="contact-icon"></span>
                                <div>{about.department}</div>
                            </div>
                        )}

                        {about.email && (
                            <div className="contact-item">
                                <span className="contact-icon"></span>
                                <div><a href={`mailto:${about.email}`}>{about.email}</a></div>
                            </div>
                        )}

                        {about.phone && (
                            <div className="contact-item">
                                <span className="contact-icon"></span>
                                <div><a href={`tel:${about.phone}`}>{about.phone}</a></div>
                            </div>
                        )}

                        {about.address && (
                            <div className="contact-item">
                                <span className="contact-icon"></span>
                                <div>{about.address}</div>
                            </div>
                        )}
                    </div>

                    <div className="contact-info-card">
                        <h3>Bilgilendirme</h3>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '0.95rem' }}>
                            İletişim bilgileri üzerinden bana ulaşabilirsiniz. E-posta yoluyla iletişime geçmeniz
                            en hızlı yanıt almanızı sağlayacaktır.
                        </p>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '0.95rem', marginTop: '16px' }}>
                            Akademik iş birliği, konferans davetleri ve diğer konular için lütfen
                            e-posta adresimi kullanınız.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
