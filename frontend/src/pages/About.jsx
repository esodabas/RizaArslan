import { useState, useEffect } from 'react';
import axios from 'axios';

export default function About() {
    const [about, setAbout] = useState({});
    const [gallery, setGallery] = useState([]);
    const [lightboxImage, setLightboxImage] = useState(null);

    useEffect(() => {
        axios.get('/api/about').then(res => setAbout(res.data)).catch(() => { });
        axios.get('/api/upload/gallery').then(res => setGallery(res.data)).catch(() => { });
    }, []);

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="about-header">
                    {about.profile_image ? (
                        <img src={about.profile_image} alt={about.full_name} className="about-image" />
                    ) : (
                        <div className="about-image" style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem'
                        }}></div>
                    )}
                    <div className="about-info">
                        <h2>{about.academic_title || 'Prof. Dr. rer. pol.'}</h2>
                        <h1>{about.full_name || 'Rıza Arslan'}</h1>
                        <ul className="about-contact-list">
                            {about.university && <li>{about.university}</li>}
                            {about.department && <li>{about.department}</li>}
                            {about.email && <li>{about.email}</li>}
                            {about.phone && <li>{about.phone}</li>}
                            {about.address && <li>{about.address}</li>}
                        </ul>
                    </div>
                </div>

                {/* Bio */}
                {about.bio && (
                    <section style={{ marginBottom: '40px' }}>
                        <div className="section-header">
                            <h2 className="section-title">Biyografi</h2>
                        </div>
                        <div className="about-bio" dangerouslySetInnerHTML={{ __html: about.bio }} />
                    </section>
                )}

                {/* Gallery */}
                {gallery.length > 0 && (
                    <section>
                        <div className="section-header">
                            <h2 className="section-title">Fotoğraf Galerisi</h2>
                        </div>
                        <div className="gallery-grid">
                            {gallery.map(image => (
                                <div className="gallery-item" key={image.id} onClick={() => setLightboxImage(image)}>
                                    <img src={image.image_path} alt={image.caption || 'Galeri görseli'} />
                                    {image.caption && <div className="gallery-caption">{image.caption}</div>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Lightbox */}
                {lightboxImage && (
                    <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
                        <button className="lightbox-close" onClick={() => setLightboxImage(null)}>✕</button>
                        <img src={lightboxImage.image_path} alt={lightboxImage.caption || ''} onClick={e => e.stopPropagation()} />
                    </div>
                )}
            </div>
        </div>
    );
}
