import fs from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://viaxcol.online';
const SITE_NAME = 'Viax Colombia';

const ROUTES = [
  {
    path: '/',
    title: 'App de transporte en Colombia',
    description:
      'Viax conecta clientes, conductores y empresas con seguimiento en tiempo real, conductores verificados y tarifas transparentes en Colombia.',
    canonical: `${SITE_URL}/`,
    visibleHtml: `
      <section class="page-hero" data-prerendered="true">
        <span class="section__badge">Viax</span>
        <h1 class="page-hero__title">App de transporte en Colombia</h1>
        <p class="page-hero__subtitle">Plataforma de movilidad para clientes, conductores y empresas.</p>
      </section>
    `,
  },
  {
    path: '/clientes',
    title: 'Viajes para clientes',
    description:
      'Solicita viajes en Moto, Carro, Mototaxi o Taxi. Revisa precio antes de confirmar y sigue tu ruta en tiempo real con Viax.',
    canonical: `${SITE_URL}/clientes`,
    visibleHtml: `
      <section class="page-hero" data-prerendered="true">
        <span class="section__badge">Clientes</span>
        <h1 class="page-hero__title">Movilidad segura y transparente para tu dia a dia</h1>
        <p class="page-hero__subtitle">Solicita viajes y conoce el precio antes de confirmar.</p>
      </section>
    `,
  },
  {
    path: '/conductores',
    title: 'Plataforma para conductores',
    description:
      'Registrate como conductor en Viax y gestiona viajes, ingresos, comisiones y documentacion desde una sola app.',
    canonical: `${SITE_URL}/conductores`,
    visibleHtml: `
      <section class="page-hero" data-prerendered="true">
        <span class="section__badge">Conductores</span>
        <h1 class="page-hero__title">Mas control, mas viajes, mas ingresos</h1>
        <p class="page-hero__subtitle">Gestiona viajes, ganancias y documentos desde Viax.</p>
      </section>
    `,
  },
  {
    path: '/empresas',
    title: 'Solucion para empresas de transporte',
    description:
      'Gestiona flota, conductores, documentos, tarifas y reportes de tu empresa de transporte con la plataforma Viax.',
    canonical: `${SITE_URL}/empresas`,
    visibleHtml: `
      <section class="page-hero" data-prerendered="true">
        <span class="section__badge">Empresas</span>
        <h1 class="page-hero__title">Gestiona tu operacion de transporte en un solo lugar</h1>
        <p class="page-hero__subtitle">Control de conductores, tarifas y reportes empresariales.</p>
      </section>
    `,
  },
  {
    path: '/legal',
    title: 'Terminos y privacidad',
    description:
      'Consulta los terminos y condiciones y la politica de privacidad de Viax para usuarios y empresas.',
    canonical: `${SITE_URL}/legal`,
    visibleHtml: `
      <section class="page-hero" data-prerendered="true">
        <span class="section__badge">Legal</span>
        <h1 class="page-hero__title">Documentos legales</h1>
        <p class="page-hero__subtitle">Consulta terminos y politicas de privacidad de Viax.</p>
      </section>
    `,
  },
  {
    path: '/eliminar-cuenta',
    title: 'Eliminacion de Cuenta - Viax',
    description:
      'Conoce como solicitar la eliminacion de tu cuenta en la app Viax, propiedad de VIAX TECHNOLOGY S.A.S., segun lineamientos de Google Play.',
    canonical: `${SITE_URL}/eliminar-cuenta`,
    visibleHtml: `
      <section class="page-hero" data-prerendered="true">
        <span class="section__badge">Google Play</span>
        <h1 class="page-hero__title">Eliminacion de Cuenta - Viax</h1>
        <p class="page-hero__subtitle">Informacion publica sobre eliminacion de cuenta y tratamiento de datos.</p>
      </section>
    `,
  },
];

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function upsertMetaByName(html, name, content) {
  const safeContent = escapeHtml(content);
  const regex = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i');
  const replacement = `<meta name="${name}" content="${safeContent}" />`;
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function upsertMetaByProperty(html, property, content) {
  const safeContent = escapeHtml(content);
  const regex = new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, 'i');
  const replacement = `<meta property="${property}" content="${safeContent}" />`;
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function upsertCanonical(html, canonical) {
  const cleaned = html.replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, '\n');
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
  return cleaned.replace('</head>', `  ${canonicalTag}\n</head>`);
}

function applySeoTags(template, route) {
  const fullTitle = `${route.title} | ${SITE_NAME}`;
  let output = template;

  output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
  output = upsertMetaByName(output, 'description', route.description);
  output = upsertMetaByName(output, 'robots', 'index, follow, max-image-preview:large');
  output = upsertCanonical(output, route.canonical);
  output = upsertMetaByProperty(output, 'og:title', fullTitle);
  output = upsertMetaByProperty(output, 'og:description', route.description);
  output = upsertMetaByProperty(output, 'og:url', route.canonical);
  output = upsertMetaByName(output, 'twitter:title', fullTitle);
  output = upsertMetaByName(output, 'twitter:description', route.description);

  return output;
}

function injectVisibleContent(html, route) {
  return html.replace(
    /<div id="root"><\/div>/i,
    `<div id="root">${route.visibleHtml}</div>`,
  );
}

function resolveOutputPath(distDir, routePath) {
  if (routePath === '/') {
    return path.join(distDir, 'index.html');
  }
  const normalized = routePath.replace(/^\//, '');
  return path.join(distDir, normalized, 'index.html');
}

async function main() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');
  const template = await fs.readFile(templatePath, 'utf8');

  for (const route of ROUTES) {
    const withSeo = applySeoTags(template, route);
    const withVisibleContent = injectVisibleContent(withSeo, route);
    const outputPath = resolveOutputPath(distDir, route.path);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, withVisibleContent, 'utf8');
  }

  const notFoundPath = path.join(distDir, '404.html');
  const notFoundHtml = template
    .replace(/<title>[\s\S]*?<\/title>/i, '<title>Pagina no encontrada | Viax Colombia</title>')
    .replace(/<div id="root"><\/div>/i, '<div id="root"><main class="page-shell"><section class="page-hero"><span class="section__badge">404</span><h1 class="page-hero__title">Pagina no encontrada</h1><p class="page-hero__subtitle">La URL solicitada no existe.</p></section></main></div>');
  await fs.writeFile(notFoundPath, upsertMetaByName(upsertCanonical(notFoundHtml, `${SITE_URL}/404`), 'robots', 'noindex, nofollow'), 'utf8');

  console.log(`Prerender completado para ${ROUTES.length} rutas SEO.`);
}

main().catch((error) => {
  console.error('Error durante prerender:', error);
  process.exit(1);
});
