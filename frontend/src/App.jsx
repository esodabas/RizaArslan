import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Books = lazy(() => import('./pages/Books'));
const Columns = lazy(() => import('./pages/Columns'));
const ColumnDetail = lazy(() => import('./pages/ColumnDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Editor = lazy(() => import('./pages/admin/Editor'));
const BookEditor = lazy(() => import('./pages/admin/BookEditor'));
const AboutEditor = lazy(() => import('./pages/admin/AboutEditor'));
const GalleryManager = lazy(() => import('./pages/admin/GalleryManager'));
const MediaManager = lazy(() => import('./pages/admin/MediaManager'));
const MediaGallery = lazy(() => import('./pages/MediaGallery'));
const Settings = lazy(() => import('./pages/admin/Settings'));

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Sayfaükleniyor...</div>}>
        <Routes>
          {/* Admin routes - no navbar/footer */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/articles/new" element={<Editor type="article" />} />
          <Route path="/admin/articles/edit/:id" element={<Editor type="article" />} />
          <Route path="/admin/columns/new" element={<Editor type="column" />} />
          <Route path="/admin/columns/edit/:id" element={<Editor type="column" />} />
          <Route path="/admin/books/new" element={<BookEditor />} />
          <Route path="/admin/books/edit/:id" element={<BookEditor />} />
          <Route path="/admin/about" element={<AboutEditor />} />
          <Route path="/admin/gallery" element={<GalleryManager />} />
          <Route path="/admin/media" element={<MediaManager />} />
          <Route path="/admin/settings" element={<Settings />} />

          {/* Public routes with navbar/footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/makaleler" element={<Articles />} />
            <Route path="/makaleler/:id" element={<ArticleDetail />} />
            <Route path="/kitaplar" element={<Books />} />
            <Route path="/bireysel-gorusler" element={<Columns />} />
            <Route path="/bireysel-gorusler/:id" element={<ColumnDetail />} />
            <Route path="/hakkimda" element={<About />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/medya" element={<MediaGallery />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
