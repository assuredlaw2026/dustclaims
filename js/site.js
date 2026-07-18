/* ─── NAV ─── */
function renderNav(activePage) {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  nav.innerHTML = `
    <a href="/" class="nav-logo">Dust<span>Claims</span>.com</a>
    <ul class="nav-links">
      <li><a href="/" ${activePage==='home'?'class="active"':''}>Home</a></li>
      <li><a href="/private-enforcement/" ${activePage==='enforcement'?'class="active"':''}>Private Enforcement</a></li>
      <li><a href="/blog/" ${activePage==='blog'?'class="active"':''}>Blog</a></li>
      <li><a href="/about/" ${activePage==='about'?'class="active"':''}>About</a></li>
      <li><a href="/contact/" class="nav-cta">Report a Claim</a></li>
    </ul>
    <button class="nav-hamburger" id="hamburger" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  `;
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
  }
}

/* ─── FOOTER ─── */
function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-grid">
      <div>
        <div class="footer-brand">Dust<span>Claims</span>.com</div>
        <p class="footer-tagline">A product of Assured Law. When public enforcement fails, private action begins.</p>
        <div class="social-links">
          <a class="social-link" href="https://www.instagram.com/AssuredLaw" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            Instagram
          </a>
          <a class="social-link" href="https://www.facebook.com/AssuredLaw" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
          <a class="social-link" href="https://x.com/AssuredLaw1" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X / Twitter
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Navigate</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/private-enforcement/">Private Enforcement</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/about/">About</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Active Cases</h4>
        <ul>
          <li><a href="/cases/pulte-lake-moor.html">Pulte / Lake Moor</a></li>
          <li><a href="/cases/three-kids-mine.html">Three Kids Mine</a></li>
          <li><a href="/contact/">Report a Claim</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Assured Law</h4>
        <ul>
          <li><a class="footer-phone" href="tel:7028253747">(702) 825-3747</a></li>
          <li><a href="#">635 W. Lake Mead Pkwy<br>Henderson, NV 89015</a></li>
          <li><a href="https://www.assuredlaw.com" target="_blank" rel="noopener">AssuredLaw.com</a></li>
          <li><a href="/admin/">Staff Login</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-disc">This website is for informational purposes only and does not constitute legal advice. No attorney-client relationship is created by visiting this site or submitting the contact form. Assured Law, Joe Yakubik, Esq., Bar No. 17015, Henderson, Nevada. This is attorney advertising. Prior results do not guarantee similar outcomes.</p>
      <span class="footer-copy">&copy; 2026 DustClaims.com</span>
    </div>
  `;
}

/* ─── ACTIVE SITES LOADER ─── */
async function loadActiveSites(filterStatus) {
  const container = document.getElementById('sites-container');
  const loading = document.getElementById('sites-loading');
  const empty = document.getElementById('sites-empty');
  if (!container) return;
  try {
    const res = await fetch('/_data/active-sites.json');
    const data = await res.json();
    let sites = data.sites || [];
    if (filterStatus && filterStatus !== 'all') {
      sites = sites.filter(s => s.status === filterStatus);
    }
    if (loading) loading.style.display = 'none';
    if (!sites.length) { if (empty) empty.style.display = 'block'; return; }
    if (empty) empty.style.display = 'none';
    const statusClass = {
      'TRO Active':'badge-tro','Active Lawsuit':'badge-lawsuit',
      'Monitoring':'badge-monitoring','Settled':'badge-settled',
      'Preliminary Injunction':'badge-tro','Closed':'badge-gray'
    };
    container.innerHTML = sites.map(s => `
      <div class="site-card">
        <div>
          <div class="site-name">${s.name}</div>
          <div class="site-contractor">Contractor: ${s.contractor}</div>
          <div class="site-address">${s.address}</div>
          <div class="site-desc">${s.description}</div>
          ${s.permit ? `<div class="site-meta" style="margin-top:0.75rem;">Case / Permit: <strong>${s.permit}</strong></div>` : ''}
        </div>
        <div style="text-align:right;">
          <span class="badge ${statusClass[s.status]||'badge-gray'}">${s.status}</span>
          <div class="site-meta">Updated: ${s.lastUpdated}</div>
        </div>
      </div>`).join('');
  } catch(e) {
    if (loading) loading.textContent = 'Unable to load site data.';
  }
}

/* ─── BLOG LOADER ─── */
async function loadBlogPosts() {
  const container = document.getElementById('blog-container');
  if (!container) return;
  try {
    const res = await fetch('/_data/posts.json');
    const data = await res.json();
    const posts = (data.posts || []).sort((a,b) => new Date(b.date) - new Date(a.date));
    if (!posts.length) {
      container.innerHTML = '<div style="text-align:center;padding:4rem;color:var(--muted);">No posts yet. Check back soon.</div>';
      return;
    }
    container.innerHTML = posts.map(p => {
      const d = new Date(p.date);
      const dateStr = d.toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});
      return `<a class="blog-card" href="/blog/${p.slug}.html">
        <div class="blog-date">${dateStr} &nbsp;&middot;&nbsp; ${p.category}</div>
        <h3>${p.title}</h3>
        <p class="blog-excerpt">${p.excerpt}</p>
      </a>`;
    }).join('');
  } catch(e) {
    container.innerHTML = '<div style="text-align:center;padding:4rem;color:var(--muted);">Unable to load posts.</div>';
  }
}

/* ─── NETLIFY IDENTITY ─── */
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) {
      window.netlifyIdentity.on('login', () => { document.location.href = '/admin/'; });
    }
  });
}
