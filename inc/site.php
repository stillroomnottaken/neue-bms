<?php
defined('APP_ROOT') or exit;
/**
 * Public website renderer.
 * Every page is a template in inc/templates/ that is a copy of the static site's HTML (same markup, same text, same CSS/JS).
 * Only these parts are filled in by PHP:  catalogue cards + material drop-downs (from Admin → Catalogue),
 * WhatsApp number / e-mail / NIB (from config.php), the footer year.
 */
function e(mixed $s): string { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

/** page id => [lang => [slug, template]] */
const SITE_PAGES = [
    'home'      => ['en' => ['',                  'en-index'],               'id' => ['',             'id-index']],
    'about'     => ['en' => ['about',             'en-about'],               'id' => ['tentang',      'id-tentang']],
    'catalogue' => ['en' => ['catalogue',         'en-catalogue'],           'id' => ['katalog',      'id-katalog']],
    'contact'   => ['en' => ['contact',           'en-contact'],             'id' => ['kontak',       'id-kontak']],
    'corn-cobs' => ['en' => ['corn-cobs',         'en-corn-cobs'],           'id' => ['corn-cobs',    'id-corn-cobs']],
    'buyers'    => ['en' => ['for-buyers',        'en-for-buyers'],          'id' => ['untuk-buyer',  'id-untuk-buyer']],
    'supplier'  => ['en' => ['become-a-supplier', 'en-become-a-supplier'],   'id' => ['jadi-supplier', 'id-jadi-supplier']],
];
function page_path(string $id, string $lang): string {
    $slug = SITE_PAGES[$id][$lang][0];
    return $lang === 'en' ? ($slug === '' ? '/' : "/$slug") : ($slug === '' ? '/id/' : "/id/$slug");
}
/** [page id, template name] for a request path like "about" (lang en) or "tentang" (lang id); null = not found */
function find_page(string $lang, string $rest): ?array {
    foreach (SITE_PAGES as $id => $langs) if ($langs[$lang][0] === $rest) return [$id, $langs[$lang][1]];
    return null;
}

const SITE_TEXT = [
    'en' => ['cta' => 'Contact us about this', 'buy' => 'BUY', 'sup' => 'SUPPLY', 'buyAria' => 'Buy from BMS (buyer)', 'supAria' => 'Supply to BMS (supplier)',
             'moreH' => 'Not listed?', 'moreP' => 'Other relevant industrial materials are welcome. Tell us what you need or can supply.'],
    'id' => ['cta' => 'Hubungi kami tentang ini', 'buy' => 'BELI', 'sup' => 'PASOK', 'buyAria' => 'Beli dari BMS (pembeli)', 'supAria' => 'Pasok ke BMS (pemasok)',
             'moreH' => 'Tidak ada di daftar?', 'moreP' => 'Material industri lain yang relevan juga kami terima. Beri tahu kami apa yang Anda butuhkan atau bisa pasok.'],
];

function catalogue_items(array $data): array {
    return array_values(array_filter($data['catalogue'] ?? [], fn($m) => !empty($m['visible'])));
}
function cat_pair(string $lang, string $slug): string {
    $t = SITE_TEXT[$lang];
    $q = '?material=' . rawurlencode($slug);
    return '<div class="pair">' . "\n"
        . '  <a class="btn btn-forest btn-need" href="' . e(page_path('buyers', $lang) . $q) . '" aria-label="' . e($t['buyAria']) . '">' . e($t['buy']) . '</a>' . "\n"
        . '  <a class="btn btn-gold" href="' . e(page_path('supplier', $lang) . $q) . '" aria-label="' . e($t['supAria']) . '">' . e($t['sup']) . '</a>' . "\n"
        . '</div>' . "\n";
}
function cat_cta(string $lang, string $slug): string {
    return '        <div class="mat-body">' . "\n" . '          <div class="mat-cta">' . "\n" . '            <small>' . e(SITE_TEXT[$lang]['cta']) . '</small>' . "\n"
        . '            ' . cat_pair($lang, $slug) . "\n" . '          </div>' . "\n" . '        </div>' . "\n";
}
function render_catalogue(array $data, string $lang): string {
    $t = SITE_TEXT[$lang];
    $o = '';
    foreach (catalogue_items($data) as $m) {
        $name = (string)($m['name'][$lang] ?? $m['name']['en'] ?? '');
        $slug = (string)$m['slug'];
        $linked = !empty($m['detail']) && isset(SITE_PAGES[$slug]);
        $h3 = $linked ? '<a href="' . e(page_path($slug, $lang)) . '">' . e($name) . '</a>' : e($name);
        $img = ($m['image'] ?? '') !== ''
            ? '<img class="mat-img" src="' . e($m['image']) . '" alt="' . e($name) . '" width="640" height="360" loading="lazy" decoding="async">'
            : '<div class="mat-img mat-ph" role="img" aria-label="' . e($name) . '"></div>';
        $desc = (string)($m['desc'][$lang] ?? '');
        $o .= "\n" . '      <article class="mat" data-cat="' . e($m['cat']) . '">' . "\n"
            . '        <div class="mat-body mat-head"><h3>' . $h3 . '</h3></div>' . "\n" . $img . ($desc !== '' ? "\n" . '        <p class="mat-desc" style="padding:10px 16px 0;margin:0">' . e($desc) . '</p>' : '') . "\n"
            . cat_cta($lang, $slug) . '      </article>';
    }
    $o .= "\n" . '      <article class="mat mat-more">' . "\n" . '        <div class="mat-body">' . "\n" . '          <h3>' . e($t['moreH']) . '</h3>' . "\n" . '          <p>' . e($t['moreP']) . '</p>' . "\n"
        . '          <div class="mat-cta">' . "\n" . '            <small>' . e($t['cta']) . '</small>' . "\n" . '            ' . cat_pair($lang, 'other') . "\n" . '          </div>' . "\n" . '        </div>' . "\n" . '      </article>';
    return $o;
}
function render_options(array $data, string $lang): string {
    $o = '';
    foreach (catalogue_items($data) as $m) $o .= '<option value="' . e($m['slug']) . '">' . e($m['name'][$lang] ?? $m['name']['en'] ?? '') . '</option>';
    return $o;
}

/** Hash of the one inline script the static pages contain (adds the "js" class), for the Content-Security-Policy */
const INLINE_JS = "document.documentElement.className='js'";
function inline_js_hash(): string { return "'sha256-" . base64_encode(hash('sha256', INLINE_JS, true)) . "'"; }

function render_template(string $name, array $data, string $lang, array $site, string $saveVer): string {
    $file = APP_ROOT . '/inc/templates/' . $name . '.html';
    $h = (string)file_get_contents($file);
    $base = base_url();
    return strtr($h, [
        '%%BASE%%' => e($base),
        '%%WA%%' => e($site['whatsapp']), '%%EMAIL%%' => e($site['email']), '%%NIB%%' => e($site['nib']),
        '%%YEAR%%' => date('Y'), '%%SAVEV%%' => e($saveVer), '%%MATCOUNT%%' => (string)count(catalogue_items($data)),
        '%%CATALOGUE%%' => render_catalogue($data, $lang), '%%MATOPTIONS%%' => render_options($data, $lang),
    ]);
}
