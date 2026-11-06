<?php
declare(strict_types=1);
/**
 * Public front controller: every website URL that is not a real file ends up here.
 * Pages are the static site's HTML (inc/templates/), with the catalogue filled in from the admin's saved content.
 */
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/site.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'HEAD'], true)) { http_response_code(405); header('Allow: GET, HEAD'); exit; }

$path = rawurldecode((string)parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH));
if (!preg_match('//u', $path) || str_contains($path, "\0")) { http_response_code(400); exit; }

// Old static-site URLs (/about.html, /id/kontak.html, /index.html) → clean URLs
if (preg_match('#^(.*?)(?:/index)?\.html?$#', $path, $m)) {
    $to = $m[1] === '' ? '/' : $m[1];
    header('Location: ' . $to, true, 301); exit;
}
$path = '/' . trim($path, '/');

$cur = content_current();
$data = $cur['data'];
$site = cfg('site');
$tplDir = __DIR__ . '/inc/templates';
$saveVer = (string)(int)@filemtime(__DIR__ . '/assets/js/save.js');
$assetVer = (string)max((int)@filemtime(__DIR__ . '/assets/css/main.css'), (int)@filemtime(__DIR__ . '/assets/js/main.js'), (int)$saveVer,
    ...array_map(fn($f) => (int)@filemtime($f), glob($tplDir . '/*.html') ?: [0]));

if ($path === '/robots.txt') {
    header('Content-Type: text/plain; charset=utf-8'); header('Cache-Control: public, max-age=3600');
    echo "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: " . base_url() . "/sitemap.xml\n"; exit;
}
if ($path === '/sitemap.xml') {
    header('Content-Type: application/xml; charset=utf-8'); header('Cache-Control: public, max-age=3600');
    $b = base_url(); $lastmod = date('Y-m-d', (int)$cur['savedAt']);
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";
    foreach (SITE_PAGES as $id => $_) foreach (['en', 'id'] as $l) {
        echo '<url><loc>' . e($b . page_path($id, $l)) . '</loc><lastmod>' . $lastmod . '</lastmod>'
            . '<xhtml:link rel="alternate" hreflang="en" href="' . e($b . page_path($id, 'en')) . '"/><xhtml:link rel="alternate" hreflang="id" href="' . e($b . page_path($id, 'id')) . '"/></url>' . "\n";
    }
    echo '</urlset>'; exit;
}

// Route: "/id/..." is Indonesian, everything else English
$lang = 'en'; $rest = trim($path, '/');
if ($rest === 'id' || str_starts_with($rest, 'id/')) { $lang = 'id'; $rest = trim(substr($rest, 2), '/'); }
$found = find_page($lang, $rest);

security_headers("default-src 'self'; script-src 'self' " . inline_js_hash() . "; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'");
header('Content-Type: text/html; charset=utf-8');

if (!$found) {
    http_response_code(404);
    header('Cache-Control: no-store');
    echo render_template('en-404', $data, 'en', $site, $saveVer); exit;
}
// Cache: always revalidate, answer 304 when nothing changed
$etag = '"' . md5($cur['rev'] . '|' . $path . '|' . $assetVer . '|' . date('Y')) . '"';
header('ETag: ' . $etag);
header('Cache-Control: public, max-age=0, must-revalidate');
if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) { http_response_code(304); exit; }
if ($method === 'HEAD') exit;
echo render_template($found[1], $data, $lang, $site, $saveVer);
