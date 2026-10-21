import os, sys

csp_meta = '''    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
    <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
'''

security_script = '    <script src="js/security.js" defer></script>\n'

base = r"D:\Important Files\HTML\Systems\RoomCheck"
for root, dirs, files in os.walk(base):
    for f in files:
        if f.endswith('.html'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            if 'Content-Security-Policy' not in content:
                if '<meta charset="UTF-8">' in content:
                    content = content.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n' + csp_meta)
                else:
                    content = content.replace('<head>', '<head>\n' + csp_meta)
            if '</body>' in content and 'security.js' not in content:
                content = content.replace('</body>', security_script + '</body>')
            content = content.replace('class="nav-link"', 'class="nav-link" aria-label="Navigation link"')
            with open(path, 'w', encoding='utf-8') as file:
                file.write(content)
            print('Updated:', f)
