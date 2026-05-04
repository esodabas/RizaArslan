import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [about, setAbout] = useState({});
    const location = useLocation();

    useEffect(() => {
        axios.get('/api/about').then(res => setAbout(res.data)).catch(() => { });
    }, []);

    const links = [
        { path: '/', label: 'Ana Sayfa' },
        { path: '/makaleler', label: 'Makaleler' },
        { path: '/kitaplar', label: 'Kitaplar' },
        { path: '/bireysel-gorusler', label: 'Bireysel Görüşler' },
        { path: '/medya', label: 'Medya' },
        { path: '/hakkimda', label: 'Hakkımda' },
        { path: '/iletisim', label: 'İletişim' },
    ];

    return (
        <header className="site-header">
            {/* Top section: Photo + Name */}
            <div className="header-top">
                <Link to="/admin" className="admin-login-btn">Admin Girişi</Link>
                <Link to="/" className="header-brand">
                    <img src="/header-photo.jpg" alt="Profil Fotoğrafı" className="header-photo" />
                </Link>
            </div>

            {/* Navigation links - centered below */}
            <nav className="header-nav">
                <button className="navbar-hamburger" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '✕' : '☰'}
                </button>

                <ul className={`header-links ${isOpen ? 'open' : ''}`}>
                    {links.map(link => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className={location.pathname === link.path ? 'active' : ''}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
