CREATE TABLE IF NOT EXISTS noticias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    resumen TEXT,
    url TEXT NOT NULL UNIQUE,
    imagen_url TEXT,
    fuente TEXT,
    categoria TEXT NOT NULL DEFAULT 'General',
    fecha_publicacion TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_noticias_fecha_publicacion ON noticias (fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_categoria_fecha ON noticias (categoria, fecha_publicacion DESC);
