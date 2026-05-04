const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let pool = null;

async function initDatabase() {
  // .env'deki DATABASE_URL'i temizle
  const rawUrl = typeof process.env.DATABASE_URL === 'string'
    ? process.env.DATABASE_URL.trim().replace(/^"|"$/g, '')
    : '';

  if (!rawUrl) {
    throw new Error('DATABASE_URL tanımlı değil! .env dosyasını kontrol edin.');
  }

  console.log('🔧 Veritabanına bağlanılıyor...');

  // sslmode parametresini URL'den kaldır - pg ssl objesini kullanacağız
  const cleanUrl = rawUrl
    .replace(/[?&]sslmode=[^&]*/g, '')
    .replace(/\?&/, '?')
    .replace(/[?&]$/, '');

  // Lokal mi Railway mi tespit et
  const isRailway = cleanUrl.includes('railway') || cleanUrl.includes('rlwy.net');
  const isLocal = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1');

  pool = new Pool({
    connectionString: cleanUrl,
    ssl: isRailway ? { rejectUnauthorized: false } : (isLocal ? false : { rejectUnauthorized: false }),
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    max: 10,
  });

  // Bağlantıyı test et
  await pool.query('SELECT 1');
  console.log('✅ Veritabanı bağlantısı başarılı');

  // Tabloları oluştur
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      content TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      description TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      publisher TEXT DEFAULT '',
      year INTEGER,
      isbn TEXT DEFAULT '',
      buy_link TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS columns_table (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      content TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      media TEXT DEFAULT '[]',
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS about (
      id INTEGER PRIMARY KEY DEFAULT 1,
      bio TEXT DEFAULT '',
      academic_title TEXT DEFAULT 'Prof. Dr. rer. pol.',
      full_name TEXT DEFAULT 'Rıza Arslan',
      university TEXT DEFAULT '',
      department TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      profile_image TEXT DEFAULT '',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      image_path TEXT NOT NULL,
      caption TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS media_table (
      id SERIAL PRIMARY KEY,
      file_path TEXT NOT NULL,
      media_type TEXT DEFAULT 'image',
      caption TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await pool.query("ALTER TABLE columns_table ADD COLUMN IF NOT EXISTS media TEXT DEFAULT '[]'");
  } catch (e) { /* eski PostgreSQL sürümü */ }

  try {
    const adminResult = await pool.query("SELECT id FROM admin WHERE username = 'admin'");
    if (adminResult.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await pool.query('INSERT INTO admin (username, password) VALUES ($1, $2)', ['admin', hashedPassword]);
      console.log('✅ Varsayılan admin oluşturuldu: admin / admin123');
    }
  } catch(err) {
    console.warn('Admin kontrolü atlandı:', err.message);
  }

  try {
    const aboutResult = await pool.query('SELECT id FROM about WHERE id = 1');
    if (aboutResult.rows.length === 0) {
      await pool.query("INSERT INTO about (id, academic_title, full_name) VALUES (1, 'Prof. Dr. rer. pol.', 'Rıza Arslan')");
    }
  } catch(err) {
    console.warn('About kaydı kontrolü atlandı:', err.message);
  }

  console.log('✅ Veritabanı başarıyla başlatıldı');
  return pool;
}

function saveDatabase() { }
function getDb() { return pool; }

// '?' parametrelerini '$1', '$2', ... şekline çevir
function adaptParams(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => '$' + (index++));
}

async function queryAll(sql, params = []) {
  try {
    const result = await pool.query(adaptParams(sql), params);
    return result.rows;
  } catch (err) {
    console.error('queryAll error:', err.message, '\nSQL:', sql);
    throw err;
  }
}

async function queryGet(sql, params = []) {
  try {
    const result = await pool.query(adaptParams(sql), params);
    return result.rows[0] || null;
  } catch (err) {
    console.error('queryGet error:', err.message, '\nSQL:', sql);
    throw err;
  }
}

async function runSql(sql, params = []) {
  try {
    let modifiedSql = adaptParams(sql);
    // INSERT işlemlerinde id döndür
    if (modifiedSql.trim().toUpperCase().startsWith('INSERT') && !modifiedSql.toUpperCase().includes('RETURNING')) {
      modifiedSql += ' RETURNING id';
    }
    const result = await pool.query(modifiedSql, params);
    return {
      lastInsertRowid: result.rows[0] ? result.rows[0].id : null,
      changes: result.rowCount
    };
  } catch (err) {
    console.error('runSql error:', err.message, '\nSQL:', sql);
    throw err;
  }
}

module.exports = { initDatabase, getDb, saveDatabase, queryAll, queryGet, runSql };
