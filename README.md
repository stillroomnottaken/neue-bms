# BMS website: PHP backend + admin dashboard

The public pages are the static site's HTML, served by plain PHP (same markup, text, CSS and JS as `public_html`). **No Node.js is needed on the server.**
Requires PHP 8.0+ (extensions: json, mbstring, fileinfo, session) on Apache/LiteSpeed (cPanel, Hostinger…) or nginx.

## Install
1. Upload everything in this folder to the web root (`public_html`) of the domain or subdomain. It must be the root of a domain, not a sub-folder.
2. Make `data/` and `uploads/` writable by PHP (chmod 755/775 as your host requires).
3. Open `https://your-domain/admin/` and sign in.
4. Optional: in `config.php` set `base_url` and `notify_email`. Uncomment the HTTPS redirect in `.htaccess` once SSL is active.
   nginx: see the snippet at the bottom.

First login: user `BMSADMIN1250` with the password you gave me. **Change it straight away** in Admin → Account (12+ characters), because it was shared in a chat.
Reset from the server: `php tools/set-password.php BMSADMIN1250`.

## What you get
| URL | |
|---|---|
| `/`, `/about`, `/catalogue`, `/contact`, `/corn-cobs`, `/for-buyers`, `/become-a-supplier` and the Indonesian versions `/id/`, `/id/tentang`, `/id/katalog`, `/id/kontak`, `/id/corn-cobs`, `/id/untuk-buyer`, `/id/jadi-supplier` | Public pages. Each one is a copy of the matching static page in `inc/templates/`; `assets/css/main.css` and `assets/js/main.js` are the static site's files unchanged. Old `.html` URLs redirect to these. Also sitemap.xml and robots.txt. |
| `/admin/` | Login, then the admin: catalogue manager, media library (real uploads), version history, contact-form **Inquiries** inbox, password change. |

What PHP fills in on the public pages: the catalogue cards, the material drop-downs on the buyer/supplier forms and the "7 Product" count on the home page (all from Admin → Catalogue), the WhatsApp number / e-mail / NIB (from `config.php`) and the footer year.
Page text and layout live in `inc/templates/*.html` (edit there to change wording). The visual page editor in the admin no longer drives the public pages; use it only for the catalogue.
The buyer/supplier forms behave exactly like the static site (they open WhatsApp). `assets/js/save.js` additionally saves a copy of each enquiry on the server (Admin → Inquiries).

Catalogue changes: edit in the admin → **Save & publish** → live immediately.

## Security
- Password stored only as a bcrypt hash (`data/users.php`), never in code. Same error for wrong user or wrong password.
- Brute-force lockout: 5 wrong passwords per IP (20 per username) → blocked 15 min. Session id renewed at login, HttpOnly + SameSite=Strict (+ Secure on HTTPS) cookie, 30 min idle / 8 h max, tied to the browser, ended on password change.
- CSRF token + same-origin check on every change. The editor page and API are never sent without a valid session.
- The server re-validates everything you save against an allow-list (types, ranges, colours, links; `javascript:` etc. refused). All output is HTML-escaped. Strict Content-Security-Policy (no inline scripts on public pages), anti-clickjacking, nosniff, HSTS on HTTPS.
- Uploads: real JPG/PNG/WebP/GIF only (checked by content, max 5 MB), random file names, no SVG, files containing code refused, `uploads/` cannot execute anything.
- `data/`, `inc/`, `tools/`, `config.php` are blocked from the web, and data files are PHP-guarded so they never print even if the block fails. Best practice: set `data_dir` in `config.php` to a folder **outside** the web root.
- Audit log (logins, saves, uploads, password changes): `data/audit.php`.
- Limits: keep PHP updated, use HTTPS, pick a long unique password. Lockout is per IP; behind Cloudflare set `trust_proxy_headers` to true.

## Rebuilding the editor (optional, needs Node)
Source is in `editor-src/` (Next.js static export): `npm ci && npm run build`, then copy `out/index.html` to `admin/app.html` and `out/_next/` to `admin/_next/`.
Site facts (WhatsApp, contacts, NIB) live in `config.php`.

## Local test
`php -S 127.0.0.1:8080 router.php`

## nginx
```
location ~ ^/(data|inc|tools|editor-src)/ { deny all; }
location = /config.php { deny all; }
location ~ ^/uploads/.*\.(php|phtml|html?|svg|js)$ { deny all; }
location / { try_files $uri $uri/ /index.php?$query_string; }
location ~ \.php$ { include fastcgi_params; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; fastcgi_pass unix:/run/php/php-fpm.sock; }
```
