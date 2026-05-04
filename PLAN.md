# Prof. Dr. rer. pol. Rıza Arslan — Akademik Blog/Portföy Websitesi

Bir akademisyen için makaleler, kitaplar, köşe yazıları ve hakkımda bölümlerini içeren, admin paneli ile yönetilebilen, otomatik kaydetme özellikli bir profesyonel blog sitesi.

---

## 🛠️ Kullanılacak Teknolojiler (Detaylı Açıklama)

### Frontend (Kullanıcının Gördüğü Taraf)

| Teknoloji | Ne İşe Yarar | Neden Bu? |
|-----------|-------------|-----------|
| **React 18** | Arayüz bileşenlerini oluşturur | En popüler UI kütüphanesi, biliyorsun |
| **Vite** | React projesini ayağa kaldırır, hızlı geliştirme | CRA'dan 10x hızlı |
| **React Router v6** | Sayfalar arası geçiş | Tek sayfa uygulamada URL yönetimi |
| **React Quill** | Zengin metin editörü | Hoca Word gibi yazı yazabilir (kalın, italik, başlık, resim) |
| **Axios** | Backend'e istek gönderir | Fetch API'den daha kullanışlı |
| **CSS (Vanilla)** | Tasarım/stil | Tam kontrol, ek bağımlılık yok |

### Backend (Arka Plan — Sunucu Tarafı)

| Teknoloji | Ne İşe Yarar | Neden Bu? |
|-----------|-------------|-----------|
| **Node.js** | JavaScript'i sunucuda çalıştırır | Aynı dil frontend-backend |
| **Express.js** | API endpoint'leri oluşturur | En popüler Node.js framework'ü |
| **better-sqlite3** | Veritabanı (SQLite) | Dosya tabanlı, kurulum gerektirmez, SQL sunucu yok |
| **JWT (jsonwebtoken)** | Admin giriş token'ı | Güvenli kimlik doğrulama |
| **bcryptjs** | Şifreyi hashleme | Admin şifresini güvenli saklar |
| **multer** | Dosya/görsel yükleme | Fotoğraf upload için |
| **cors** | Cross-origin izinleri | Frontend'in backend'e erişmesi için |

### Veritabanı

| Teknoloji | Ne İşe Yarar |
|-----------|-------------|
| **SQLite** | Tüm verileri saklar (makaleler, kitaplar, yazılar). Ayrı bir veritabanı sunucusu kurman gerekmez, tek bir dosya olarak çalışır |

---

## 📁 Proje Yapısı

```
C:\Users\Bilal_Pc\Desktop\RızaArslan\
├── backend/
│   ├── server.js              # Ana sunucu dosyası
│   ├── package.json           # Backend bağımlılıkları
│   ├── database.js            # SQLite bağlantısı
│   ├── middleware/
│   │   └── auth.js            # JWT doğrulama
│   ├── routes/
│   │   ├── auth.js            # Giriş API
│   │   ├── articles.js        # Makaleler API
│   │   ├── books.js           # Kitaplar API
│   │   ├── columns.js         # Köşe Yazıları API
│   │   ├── about.js           # Hakkımda API
│   │   └── upload.js          # Görsel yükleme API
│   ├── uploads/               # Yüklenen görseller
│   └── data/
│       └── database.sqlite    # Veritabanı dosyası
│
├── frontend/
│   ├── index.html
│   ├── package.json           # Frontend bağımlılıkları
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css          # Ana stil
│       ├── pages/
│       │   ├── Home.jsx           # Ana sayfa
│       │   ├── Articles.jsx       # Makaleler listesi
│       │   ├── ArticleDetail.jsx  # Makale detay
│       │   ├── Books.jsx          # Kitaplar listesi
│       │   ├── BookDetail.jsx     # Kitap detay
│       │   ├── Columns.jsx        # Köşe yazıları listesi
│       │   ├── ColumnDetail.jsx   # Köşe yazısı detay
│       │   ├── About.jsx          # Hakkımda + galeri
│       │   ├── Contact.jsx        # İletişim
│       │   └── admin/
│       │       ├── Login.jsx      # Admin giriş
│       │       ├── Dashboard.jsx  # Admin panel
│       │       └── Editor.jsx     # Yazı editörü (auto-save)
│       └── components/
│           ├── Navbar.jsx
│           ├── Footer.jsx
│           ├── ArticleCard.jsx
│           ├── BookCard.jsx
│           ├── ColumnCard.jsx
│           └── ImageGallery.jsx
```

---

## 🗄️ Veritabanı Şeması

```sql
-- Admin kullanıcı (sadece 1 kişi)
CREATE TABLE admin (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL  -- bcrypt ile hashlenmiş
);

-- Makaleler
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,          -- HTML formatında zengin metin
    summary TEXT,          -- Kısa özet
    cover_image TEXT,      -- Kapak görseli yolu
    status TEXT DEFAULT 'draft',  -- 'draft' veya 'published'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Kitaplar
CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    publisher TEXT,        -- Yayınevi
    year INTEGER,          -- Basım yılı
    isbn TEXT,
    buy_link TEXT,         -- Satın alma linki
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Köşe Yazıları
CREATE TABLE columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hakkımda (tek satır, güncellenir)
CREATE TABLE about (
    id INTEGER PRIMARY KEY DEFAULT 1,
    bio TEXT,              -- Biyografi HTML
    academic_title TEXT,   -- Unvan
    university TEXT,
    department TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Galeri görselleri
CREATE TABLE gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_path TEXT NOT NULL,
    caption TEXT,          -- Görsel açıklaması
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoint'leri

| Method | Endpoint | Açıklama | Auth? |
|--------|----------|----------|-------|
| POST | `/api/auth/login` | Admin giriş | ❌ |
| GET | `/api/articles` | Tüm makaleleri listele | ❌ |
| GET | `/api/articles/:id` | Makale detay | ❌ |
| POST | `/api/articles` | Yeni makale ekle | ✅ |
| PUT | `/api/articles/:id` | Makale güncelle (auto-save) | ✅ |
| DELETE | `/api/articles/:id` | Makale sil | ✅ |
| GET | `/api/books` | Tüm kitapları listele | ❌ |
| POST | `/api/books` | Yeni kitap ekle | ✅ |
| PUT | `/api/books/:id` | Kitap güncelle | ✅ |
| DELETE | `/api/books/:id` | Kitap sil | ✅ |
| GET | `/api/columns` | Tüm köşe yazılarını listele | ❌ |
| GET | `/api/columns/:id` | Köşe yazısı detay | ❌ |
| POST | `/api/columns` | Yeni köşe yazısı ekle | ✅ |
| PUT | `/api/columns/:id` | Köşe yazısı güncelle (auto-save) | ✅ |
| DELETE | `/api/columns/:id` | Köşe yazısı sil | ✅ |
| GET | `/api/about` | Hakkımda bilgisini getir | ❌ |
| PUT | `/api/about` | Hakkımda güncelle | ✅ |
| GET | `/api/gallery` | Galeri görselleri | ❌ |
| POST | `/api/upload` | Görsel yükle | ✅ |
| DELETE | `/api/gallery/:id` | Galeri görseli sil | ✅ |

---

## 🔄 Otomatik Kaydetme (Auto-Save) Nasıl Çalışacak?

1. Hoca editörde yazı yazarken, her **3 saniye** boyunca tuşa basmadığında otomatik kaydedilir (debounce)
2. Kaydedilirken sağ üstte küçük bir "Kaydediliyor..." → "Kaydedildi ✓" göstergesi çıkar
3. İlk olarak "taslak" (`draft`) olarak kaydedilir
4. Hoca hazır olduğunda "Yayınla" butonuna basar → `status: published` olur
5. Sadece `published` yazılar ziyaretçilere görünür

---

## Proposed Changes

### Backend

#### [NEW] [package.json](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/backend/package.json)
Backend bağımlılıkları: express, better-sqlite3, jsonwebtoken, bcryptjs, multer, cors

#### [NEW] [server.js](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/backend/server.js)
Express sunucusu, middleware'ler, route bağlantıları, port 5000

#### [NEW] [database.js](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/backend/database.js)
SQLite bağlantısı, tablo oluşturma, varsayılan admin kullanıcı ekleme

#### [NEW] [middleware/auth.js](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/backend/middleware/auth.js)
JWT token doğrulama middleware'i

#### [NEW] [routes/auth.js](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/backend/routes/auth.js)
Admin giriş endpoint'i

#### [NEW] [routes/articles.js](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/backend/routes/articles.js)
CRUD işlemleri: listeleme, detay, ekleme, güncelleme, silme

#### [NEW] [routes/books.js](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/backend/routes/books.js)
CRUD işlemleri: listeleme, detay, ekleme, güncelleme, silme

#### [NEW] [routes/columns.js](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/backend/routes/columns.js)
CRUD işlemleri: listeleme, detay, ekleme, güncelleme, silme

#### [NEW] [routes/about.js](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/backend/routes/about.js)
Hakkımda bilgisi getir/güncelle

#### [NEW] [routes/upload.js](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/backend/routes/upload.js)
Görsel yükleme (multer), galeri CRUD

---

### Frontend

#### [NEW] [package.json](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/frontend/package.json)
Frontend bağımlılıkları: react, react-router-dom, react-quill, axios

#### [NEW] [vite.config.js](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/frontend/vite.config.js)
Vite yapılandırması, proxy ayarı (backend'e yönlendirme)

#### [NEW] [src/index.css](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/frontend/src/index.css)
Tema, renkler, tipografi, tüm sayfa stilleri. Koyu akademik tema, modern tasarım.

#### [NEW] [src/App.jsx](file:///C:/Users/Bilal_Pc/Desktop/RızaArslan/frontend/src/App.jsx)
Router ayarları, tüm sayfaların bağlanması

#### [NEW] Sayfa Bileşenleri (`src/pages/`)
Home, Articles, ArticleDetail, Books, BookDetail, Columns, ColumnDetail, About, Contact

#### [NEW] Admin Bileşenleri (`src/pages/admin/`)
Login, Dashboard, Editor (zengin metin editörü + auto-save)

#### [NEW] Ortak Bileşenler (`src/components/`)
Navbar, Footer, ArticleCard, BookCard, ColumnCard, ImageGallery

---

## 🖥️ Kodladıktan Sonra Senin Yapman Gerekenler

### 1. Node.js Kur (Zaten kurulu olabilir)
- [nodejs.org](https://nodejs.org) adresinden **LTS** sürümü indir ve kur
- Terminalde `node --version` ve `npm --version` ile kontrol et

### 2. Backend'i Başlat
```bash
cd C:\Users\Bilal_Pc\Desktop\RızaArslan\backend
npm install          # Bağımlılıkları indir (1 kere)
npm start            # Sunucuyu başlat (port 5000)
```

### 3. Frontend'i Başlat
```bash
cd C:\Users\Bilal_Pc\Desktop\RızaArslan\frontend
npm install          # Bağımlılıkları indir (1 kere)
npm run dev          # Geliştirme sunucusunu başlat (port 5173)
```

### 4. Siteye Eriş
- **Site**: `http://localhost:5173`
- **Admin Giriş**: `http://localhost:5173/admin`
- **Varsayılan Admin**: Kullanıcı adı: `admin` / Şifre: `admin123` (sonra değiştirebilirsin)

> [!IMPORTANT]
> `npm install` sadece 1 kere yapılır. Sonraki kullanımlarda sadece `npm start` ve `npm run dev` yeterli.

---

## Verification Plan

### Browser Testleri
1. Backend'i başlat (`npm start`), `http://localhost:5000/api/articles` adresinin çalıştığını browser ile kontrol et
2. Frontend'i başlat (`npm run dev`), `http://localhost:5173` adresinde ana sayfanın göründüğünü kontrol et
3. Admin paneline giriş yap, bir makale oluştur, otomatik kaydetmenin çalıştığını doğrula
4. Ziyaretçi tarafında makalenin göründüğünü kontrol et

### Manuel Doğrulama
- Tüm sayfalar arası navigasyonun çalıştığını kontrol et
- Responsive tasarımın mobilde düzgün göründüğünü kontrol et
