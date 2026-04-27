import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const crmDir = path.join(rootDir, 'crm');
const outputPath = path.join(__dirname, 'crm-worker.js');

const files = {
  '/index.html': fs.readFileSync(path.join(crmDir, 'index.html'), 'utf8'),
  '/styles.css': fs.readFileSync(path.join(crmDir, 'styles.css'), 'utf8'),
  '/config.js': fs.readFileSync(path.join(crmDir, 'config.js'), 'utf8'),
  '/api.js': fs.readFileSync(path.join(crmDir, 'api.js'), 'utf8'),
  '/app.js': fs.readFileSync(path.join(crmDir, 'app.js'), 'utf8'),
};

const mimeTypes = {
  '/index.html': 'text/html; charset=utf-8',
  '/styles.css': 'text/css; charset=utf-8',
  '/config.js': 'application/javascript; charset=utf-8',
  '/api.js': 'application/javascript; charset=utf-8',
  '/app.js': 'application/javascript; charset=utf-8',
};

const generated = `const STATIC_ASSETS = ${JSON.stringify(files, null, 2)};
const MIME_TYPES = ${JSON.stringify(mimeTypes, null, 2)};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);

    if (pathname.startsWith('/api/admin/')) {
      return proxyAdminRequest(request, env, pathname, url.search);
    }

    if (pathname === '/' || pathname === '/index.html') {
      return serveStatic('/index.html');
    }

    if (STATIC_ASSETS[pathname]) {
      return serveStatic(pathname);
    }

    return new Response('Not found', { status: 404 });
  },
};

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function serveStatic(pathname) {
  return new Response(STATIC_ASSETS[pathname], {
    status: 200,
    headers: {
      'Content-Type': MIME_TYPES[pathname] || 'text/plain; charset=utf-8',
      'Cache-Control': pathname === '/index.html'
        ? 'no-store'
        : 'public, max-age=300',
    },
  });
}

async function proxyAdminRequest(request, env, pathname, search) {
  const accessEmail =
    request.headers.get('Cf-Access-Authenticated-User-Email') ||
    request.headers.get('cf-access-authenticated-user-email') ||
    '';

  if (!accessEmail) {
    return new Response(JSON.stringify({
      error: 'Unauthorized',
      message: 'Cloudflare Access requerido.',
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }

  const upstreamUrl = \`\${env.FORM_ADMIN_BASE_URL || 'https://form.planespro.cl'}\${pathname}\${search || ''}\`;
  const headers = new Headers(request.headers);
  headers.set('X-Admin-Key', env.ADMIN_PROXY_KEY || '');
  headers.delete('host');

  const init = {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  };

  const upstreamResponse = await fetch(upstreamUrl, init);
  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete('content-security-policy');
  responseHeaders.delete('content-security-policy-report-only');

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
`;

fs.writeFileSync(outputPath, generated, 'utf8');
console.log(`Generated ${path.relative(rootDir, outputPath)}`);
