const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let pool = null;
let dbConfig = null;

function createPool(cleanUrl, isRailway, isLocal) {
  const isNeon = cleanUrl.includes('neon.tech');
  const p = new Pool({
    connectionString: cleanUrl,
    ssl: (isRailway || isNeon) ? { rejectUnauthorized: false } : (isLocal ? false : { rejectUnauthorized: false }),
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 600000,
    max: 10,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  // Bağlantı hatasında otomatik yeniden bağlan
  p.on('error', (err) => {
    console.error('Pool baglanti hatasi, yeniden baglaniliyor...', err.message);
    setTimeout(() => {
      if (dbConfig) {
        pool = createPool(dbConfig.cleanUrl, dbConfig.isRailway, dbConfig.isLocal);
      }
    }, 3000);
  });

  return p;
}

async function initDatabase() {
  const rawUrl = typeof process.env.DATABASE_URL === 'string'
    ? process.env.DATABASE_URL.trim().replace(/^"|"$/g, '')
    : '';

  if (!rawUrl) {
    throw new Error('DATABASE_URL tanimli degil! .env dosyasini kontrol edin.');
  }

  console.log('Veritabanina baglaniliyor...');

  const cleanUrl = rawUrl
    .replace(/[?&]sslmode=[^&]*/g, '')
    .replace(/\?&/, '?')
    .replace(/[?&]$/, '');

  const isRailway = cleanUrl.includes('railway') || cleanUrl.includes('rlwy.net');
  const isLocal = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1');

  dbConfig = { cleanUrl, isRailway, isLocal };
  pool = createPool(cleanUrl, isRailway, isLocal);

  // Bağlantıyı test et
  await pool.query('SELECT 1');
  console.log('Veritabani baglantisi basarili');

  // Tabloları oluştur
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      content TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      file_path TEXT DEFAULT '',
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      description TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      file_path TEXT DEFAULT '',
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
      cover_image TEXT DEFAULT '',
      media TEXT DEFAULT '[]',
      file_path TEXT DEFAULT '',
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS about (
      id INTEGER PRIMARY KEY DEFAULT 1,
      bio TEXT DEFAULT '',
      academic_title TEXT DEFAULT 'Prof. Dr. rer. pol.',
      full_name TEXT DEFAULT 'Riza Arslan',
      university TEXT DEFAULT '',
      department TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      profile_image TEXT DEFAULT '',
      media_items TEXT DEFAULT '[]',
      universities_list TEXT DEFAULT '[]',
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
    await pool.query("ALTER TABLE columns_table ADD COLUMN IF NOT EXISTS file_path TEXT DEFAULT ''");
    await pool.query("ALTER TABLE columns_table ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT ''");
    await pool.query("ALTER TABLE books ADD COLUMN IF NOT EXISTS file_path TEXT DEFAULT ''");
    await pool.query("ALTER TABLE articles ADD COLUMN IF NOT EXISTS file_path TEXT DEFAULT ''");
    await pool.query("ALTER TABLE about ADD COLUMN IF NOT EXISTS media_items TEXT DEFAULT '[]'");
    await pool.query("ALTER TABLE about ADD COLUMN IF NOT EXISTS universities_list TEXT DEFAULT '[]'");
    await pool.query("ALTER TABLE admin ADD COLUMN IF NOT EXISTS email TEXT DEFAULT ''");
  } catch (e) { /* zaten var */ }

  try {
    const adminResult = await pool.query("SELECT id FROM admin WHERE username = 'admin'");
    if (adminResult.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('Ad123', 10);
      await pool.query('INSERT INTO admin (username, password) VALUES ($1, $2)', ['admin', hashedPassword]);
      console.log('Varsayilan admin olusturuldu: admin / Ad123');
    }
  } catch(err) {
    console.warn('Admin kontrolu atlandi:', err.message);
  }

  try {
    const aboutResult = await pool.query('SELECT id FROM about WHERE id = 1');
    if (aboutResult.rows.length === 0) {
      await pool.query("INSERT INTO about (id, academic_title, full_name) VALUES (1, 'Prof. Dr. rer. pol.', 'Riza Arslan')");
    }
  } catch(err) {
    console.warn('About kaydi kontrolu atlandi:', err.message);
  }

  console.log('Veritabani basariyla baslatildi');
  return pool;
}

function saveDatabase() { }
function getDb() { return pool; }

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
