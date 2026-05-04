import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">

                <div className="footer-links">
                    <Link to="/makaleler">Makaleler</Link>
                    <Link to="/kitaplar">Kitaplar</Link>
                    <Link to="/bireysel-gorusler">Bireysel Görüşler</Link>
                    <Link to="/medya">Medya</Link>
                    <Link to="/iletisim">İletişim</Link>
                </div>
            </div>
        </footer>
    );
}
