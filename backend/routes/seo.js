const express = require('express');
const router = express.Router();

const DOMAIN = 'https://www.wanderlankatours.com'; // Replace with actual domain in production

router.get('/sitemap.xml', (req, res) => {
    const urls = [
        '/',
        '/index.html',
        '/about.html',
        '/services.html',
        '/destinations.html',
        '/packages.html',
        '/gallery.html',
        '/contact.html'
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(url => `
    <url>
        <loc>${DOMAIN}${url}</loc>
        <changefreq>weekly</changefreq>
        <priority>${url === '/' || url === '/index.html' ? '1.0' : '0.8'}</priority>
    </url>
    `).join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
});

router.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Sitemap: ${DOMAIN}/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robots);
});

module.exports = router;
