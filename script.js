/* ---- Site settings: edit these before launch ---- */
const PARADISE = {
    whatsapp: '971500000000',          // WhatsApp number, country code first, no + or spaces
    email: 'hello@paradise.example',   // enquiries are emailed here if no form endpoint is set
    formEndpoint: '',                  // optional: Formspree / Getform URL. When set, enquiries are POSTed there instead
    demo: { enabled: true, by: 'Your Agency', link: '' }   // small "demo prepared by" pill. Set enabled:false for production
};

document.addEventListener('DOMContentLoaded', () => {
    const A = window.anime || null; // anime.js — everything below falls back gracefully if it didn't load
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ================= Loader (anime.js) ================= */
    document.body.classList.add('is-loading');
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="loader-inner"><div class="loader-brand"><span class="loader-mark"></span>Paradise</div><div class="loader-line"><i></i></div></div>';
    document.body.prepend(loader);

    if (A && !reduceMotion) {
        A.timeline({ easing: 'easeOutExpo' })
            .add({ targets: loader.querySelector('.loader-mark'), scale: [0, 1], rotate: [-90, 0], duration: 700 })
            .add({ targets: loader.querySelector('.loader-brand'), opacity: [0, 1], translateY: [10, 0], duration: 500 }, '-=500')
            .add({ targets: loader.querySelector('.loader-line i'), width: ['0%', '100%'], duration: 700, easing: 'easeInOutQuad' }, '-=200')
            .add({
                targets: loader, opacity: [1, 0], duration: 500, easing: 'easeInQuad', complete: () => {
                    loader.remove(); document.body.classList.remove('is-loading')
                }
            }, '+=120');
    } else {
        setTimeout(() => { loader.classList.add('hide'); document.body.classList.remove('is-loading'); setTimeout(() => loader.remove(), 500) }, 850);
    }

    /* ================= Nav + burger + filters + year (unchanged core behaviour) ================= */
    const nav = document.querySelector('.nav');
    const burger = document.querySelector('.nav-burger');
    if (nav) { const check = () => { nav.classList.toggle('scrolled', scrollY > 50) }; check(); addEventListener('scroll', check, { passive: true }) }
    if (burger) {
        burger.addEventListener('click', () => {
            let open = document.querySelector('.mobile-panel');
            if (open) { if (A) A({ targets: open, opacity: [1, 0], translateY: [0, -10], duration: 220, easing: 'easeInQuad', complete: () => open.remove() }); else open.remove(); return }
            open = document.createElement('div'); open.className = 'mobile-panel';
            open.innerHTML = '<a href="index.html">Home</a><a href="listings.html">Listings</a><a href="about.html">Our Story</a><a href="journal.html">Journal</a><a href="contact.html">Contact</a>';
            Object.assign(open.style, { position: 'fixed', top: 'calc(var(--gap) * 2 + 86px)', left: 'var(--gap)', right: 'var(--gap)', background: 'var(--paper)', color: 'var(--ink)', padding: '26px 22px', display: 'grid', gap: '18px', zIndex: '49', borderRadius: 'var(--radius-lg)', boxShadow: '0 8px 30px rgba(17,19,15,.15)', fontSize: '15px' });
            document.body.appendChild(open);
            if (A) A({ targets: open.children, opacity: [0, 1], translateX: [-16, 0], delay: A.stagger(60), duration: 400, easing: 'easeOutQuad' });
        })
    }
    const grid = document.querySelector('.all-listings');
    if (grid) {
        const cards = Array.from(grid.querySelectorAll('[data-type]'));
        const qEl = document.getElementById('q'), sortEl = document.getElementById('sort'), countEl = document.getElementById('count'), emptyEl = document.getElementById('empty');
        let f = 'all', q = '';
        const apply = animate => {
            let n = 0;
            cards.forEach(c => {
                const show = (f === 'all' || (f === 'saved' ? (window.__isSaved ? window.__isSaved(c.getAttribute('href')) : false) : c.dataset.type === f)) && (!q || (c.dataset.name + ' ' + c.dataset.area).toLowerCase().includes(q));
                c.style.display = show ? '' : 'none';
                if (show) { n++; if (animate && A && !reduceMotion) A({ targets: c, opacity: [0, 1], translateY: [16, 0], duration: 450, easing: 'easeOutQuad' }); else c.style.opacity = 1 }
            });
            if (countEl) countEl.textContent = n + (n === 1 ? ' home' : ' homes');
            if (emptyEl) emptyEl.hidden = n > 0;
        };
        document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); f = btn.dataset.filter; apply(true);
        }));
        if (qEl) qEl.addEventListener('input', () => { q = qEl.value.trim().toLowerCase(); apply(false) });
        if (sortEl) sortEl.addEventListener('change', () => {
            const d = sortEl.value;
            cards.slice().sort((x, y) => d === 'desc' ? y.dataset.price - x.dataset.price : d === 'asc' ? x.dataset.price - y.dataset.price : x.dataset.i - y.dataset.i).forEach(c => grid.appendChild(c));
        });
        apply(false);
    }
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

    const LOCAL = ['assets/dubai-skyline.jpg', 'assets/dubai-waterfront.jpg', 'assets/dubai-night.jpg', 'assets/dubai-beach-residence.jpg', 'assets/modern-tower.jpg'];
    document.querySelectorAll('img').forEach((img, i) => {
        img.addEventListener('error', () => { if (img.dataset.fb) return; img.dataset.fb = '1'; img.src = LOCAL[i % LOCAL.length] });
    });

    /* ================= Enquiry delivery (endpoint -> else mailto) ================= */
    const collect = form => Array.from(form.querySelectorAll('.field')).map(f => {
        const l = f.querySelector('label'), c = f.querySelector('input,select,textarea');
        return l && c && c.value ? l.textContent.trim() + ': ' + c.value.trim() : null
    }).filter(Boolean);
    const sendEnquiry = form => {
        const lines = collect(form); lines.push('Page: ' + location.href);
        if (PARADISE.formEndpoint) {
            fetch(PARADISE.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ message: lines.join('\n') }) }).catch(() => { });
        } else {
            location.href = 'mailto:' + PARADISE.email + '?subject=' + encodeURIComponent('Enquiry — ' + document.title.split('—')[0].trim()) + '&body=' + encodeURIComponent(lines.join('\n'));
        }
    };
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', e => {
        e.preventDefault(); sendEnquiry(contactForm);
        contactForm.innerHTML = '<div class="field full"><div class="eyebrow">Thank you</div><h3>Your enquiry is on its way.</h3><p>A Paradise agent will be in touch within one business day.</p></div>';
    });

    /* ================= WhatsApp button ================= */
    const wa = document.createElement('a');
    wa.className = 'wa-btn'; wa.target = '_blank'; wa.rel = 'noopener'; wa.setAttribute('aria-label', 'Chat on WhatsApp');
    wa.href = 'https://wa.me/' + PARADISE.whatsapp + '?text=' + encodeURIComponent('Hello Paradise, I am interested in ' + document.title.split('—')[0].trim());
    wa.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H9l-5 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg><span>WhatsApp</span>';
    document.body.appendChild(wa);

    /* ================= Shortlist (saved homes) + share ================= */
    let saved = []; try { saved = JSON.parse(localStorage.getItem('psaved') || '[]') } catch (e) { }
    const persist = () => { try { localStorage.setItem('psaved', JSON.stringify(saved)) } catch (e) { } };
    const isSaved = href => saved.includes(href);
    const toggleSaved = href => { saved = isSaved(href) ? saved.filter(x => x !== href) : saved.concat(href); persist() };
    const savedCount = document.getElementById('savedCount');
    const paintSaved = () => {
        if (savedCount) savedCount.textContent = saved.length;
        document.querySelectorAll('.save-btn').forEach(b => { const on = isSaved(b.dataset.href); b.textContent = on ? '♥' : '♡'; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on) });
        const pb = document.querySelector('[data-save]'); if (pb) pb.textContent = (isSaved(page0) ? '♥ Saved' : '♡ Save');
    };
    const page0 = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.all-listings .property-card').forEach(card => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'save-btn'; b.dataset.href = card.getAttribute('href'); b.setAttribute('aria-label', 'Save ' + (card.dataset.name || 'home'));
        b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleSaved(b.dataset.href); paintSaved(); if (document.querySelector('[data-filter="saved"].active')) document.querySelector('[data-filter="saved"]').click() });
        card.appendChild(b);
    });
    const pageSave = document.querySelector('[data-save]');
    if (pageSave) pageSave.addEventListener('click', () => { toggleSaved(page0); paintSaved() });
    const share = document.querySelector('[data-share]');
    if (share) share.addEventListener('click', async () => {
        const data = { title: document.title, url: location.href };
        try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(location.href); share.textContent = 'Link copied'; setTimeout(() => share.textContent = 'Share', 1800) } } catch (e) { }
    });
    window.__isSaved = isSaved;
    paintSaved();

    /* ================= Back to top ================= */
    const back = document.createElement('button'); back.className = 'backtop'; back.setAttribute('aria-label', 'Back to top'); back.textContent = '↑'; document.body.appendChild(back);
    addEventListener('scroll', () => back.classList.toggle('show', scrollY > 700), { passive: true });
    back.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
    back.addEventListener('mouseenter', () => { if (A) A({ targets: back, rotate: 360, duration: 500, easing: 'easeInOutQuad' }) });

    /* ================= Custom cursor ================= */
    if (matchMedia('(pointer:fine)').matches) {
        const c = document.createElement('div'); c.className = 'cursor'; document.body.appendChild(c);
        addEventListener('pointermove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px' });
        document.querySelectorAll('a,button,.property-card,.article').forEach(el => { el.addEventListener('mouseenter', () => c.classList.add('big')); el.addEventListener('mouseleave', () => c.classList.remove('big')) })
    }

    /* ================= Page transitions ================= */
    document.querySelectorAll('a[href]').forEach(a => {
        const url = new URL(a.href, location.href);
        if (url.origin === location.origin && url.pathname.endsWith('.html') && url.pathname !== location.pathname) {
            a.addEventListener('click', e => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                if (A && !reduceMotion) A({ targets: document.body, opacity: [1, .25], duration: 350, easing: 'easeInQuad' });
                else { document.body.style.transition = 'opacity .35s'; document.body.style.opacity = '.25' }
                setTimeout(() => location.href = a.href, 260);
            })
        }
    });

    addEventListener('pageshow', e => {
        if (e.persisted) { document.body.style.opacity = ''; document.body.style.transition = ''; document.body.classList.remove('is-loading'); document.querySelectorAll('.loader').forEach(l => l.remove()) }
    });

    /* ================= Reveal-on-scroll (anime.js stagger, CSS fallback) ================= */
    document.querySelectorAll('.listing-grid, .gallery-grid, .all-listings, .journal-side').forEach(grid => {
        Array.from(grid.children).forEach((child) => child.classList.add('reveal'));
    });
    const revealTargets = document.querySelectorAll('.reveal');
    if (A && !reduceMotion) {
        revealTargets.forEach(el => { el.style.opacity = 0 });
        const revealObs = new IntersectionObserver(entries => entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            revealObs.unobserve(entry.target);
            A({ targets: entry.target, opacity: [0, 1], translateY: [36, 0], duration: 900, easing: 'easeOutExpo' });
        }), { threshold: .12 });
        revealTargets.forEach(x => revealObs.observe(x));
    } else {
        const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } }), { threshold: .12 });
        revealTargets.forEach(x => obs.observe(x));
    }

    /* ================= Hero entrance (anime.js stagger on load) ================= */
    if (A && !reduceMotion) {
        const heroBits = ['.hero .eyebrow', '.hero h1', '.hero-copy', '.hero-actions', '.scroll', '.page-hero .eyebrow', '.page-hero h1', '.page-hero p'];
        const found = heroBits.map(s => document.querySelector(s)).filter(Boolean);
        if (found.length) {
            A.set(found, { opacity: 0, translateY: 26 });
            A({ targets: found, opacity: [0, 1], translateY: [26, 0], delay: A.stagger(110, { start: 400 }), duration: 900, easing: 'easeOutExpo' });
        }
    }

    document.querySelectorAll('video').forEach(v => {
        const fail = () => { const m = v.closest('.hero-media'); if (m) m.classList.add('video-failed'); v.style.display = 'none'; };
        v.addEventListener('error', fail);
        const src = v.querySelector('source'); if (src) src.addEventListener('error', fail);
    });

    /* ================= Enquiry button + modal ================= */
    const pageTitle = document.title.split('—')[0].trim();
    const enquiryBtn = document.createElement('button');
    enquiryBtn.className = 'enquiry-btn';
    enquiryBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><span>Enquiry</span>';
    document.body.appendChild(enquiryBtn);

    const enquiryOverlay = document.createElement('div');
    enquiryOverlay.className = 'mx-overlay';
    enquiryOverlay.innerHTML = `
      <button class="mx-close" data-close aria-label="Close">&times;</button>
      <div class="enquiry-panel">
        <div class="eyebrow">Start a conversation</div>
        <h2>Send an enquiry</h2>
        <form class="form" id="mxEnquiryForm">
          <div class="field"><label>First name</label><input required></div>
          <div class="field"><label>Last name</label><input required></div>
          <div class="field"><label>Email</label><input type="email" required></div>
          <div class="field"><label>Phone</label><input></div>
          <div class="field full"><label>Interested in</label><input value="${pageTitle === 'Paradise' ? '' : pageTitle}" placeholder="A property, a neighborhood..."></div>
          <div class="field full"><label>Message</label><textarea placeholder="Tell us what you're looking for..."></textarea></div>
          <div class="field full"><button class="btn" type="submit">Send enquiry →</button></div>
        </form>
        <div class="enquiry-success" hidden>
          <div class="eyebrow">Thank you</div>
          <h3>Your enquiry is on its way.</h3>
          <p>A Paradise agent will be in touch within one business day.</p>
        </div>
      </div>`;
    document.body.appendChild(enquiryOverlay);
    const enquiryPanel = enquiryOverlay.querySelector('.enquiry-panel');

    function openOverlay(overlay, panel) {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (A && !reduceMotion && panel) A({ targets: panel, opacity: [0, 1], translateY: [26, 0], scale: [.96, 1], duration: 500, easing: 'easeOutExpo' });
    }
    function closeMx(overlay, panel) {
        const finish = () => { overlay.classList.remove('open'); if (!document.querySelector('.mx-overlay.open')) document.body.style.overflow = '' };
        if (A && !reduceMotion && panel) A({ targets: panel, opacity: [1, 0], translateY: [0, 16], scale: [1, .97], duration: 260, easing: 'easeInQuad', complete: finish });
        else finish();
    }

    enquiryBtn.addEventListener('click', () => openOverlay(enquiryOverlay, enquiryPanel));
    if (A && !reduceMotion) {
        A({ targets: enquiryBtn, opacity: [0, 1], translateY: [16, 0], duration: 600, delay: 1100, easing: 'easeOutExpo' });
        A({ targets: enquiryBtn, scale: [1, 1.06], duration: 900, delay: 2200, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
        enquiryBtn.addEventListener('mouseenter', () => A({ targets: enquiryBtn, translateY: -4, duration: 250, easing: 'easeOutQuad' }));
        enquiryBtn.addEventListener('mouseleave', () => A({ targets: enquiryBtn, translateY: 0, duration: 250, easing: 'easeOutQuad' }));
    }
    enquiryOverlay.querySelector('[data-close]').addEventListener('click', () => closeMx(enquiryOverlay, enquiryPanel));
    enquiryOverlay.addEventListener('click', e => { if (e.target === enquiryOverlay) closeMx(enquiryOverlay, enquiryPanel) });
    enquiryOverlay.querySelector('#mxEnquiryForm').addEventListener('submit', e => {
        e.preventDefault();
        sendEnquiry(e.target);
        const form = enquiryOverlay.querySelector('#mxEnquiryForm'), success = enquiryOverlay.querySelector('.enquiry-success');
        form.hidden = true; success.hidden = false;
        if (A && !reduceMotion) A({ targets: success, opacity: [0, 1], translateY: [16, 0], duration: 500, easing: 'easeOutExpo' });
        setTimeout(() => closeMx(enquiryOverlay, enquiryPanel), 2600);
    });

    /* ================= Shared image-zoom / video lightbox ================= */
    const zoomOverlay = document.createElement('div');
    zoomOverlay.className = 'mx-overlay';
    zoomOverlay.innerHTML = '<button class="mx-close" data-close aria-label="Close">&times;</button><div class="mx-imgwrap"><img alt=""><span class="mx-hint">Click image to zoom in / out</span></div>';
    document.body.appendChild(zoomOverlay);
    const zoomWrap = zoomOverlay.querySelector('.mx-imgwrap');
    const zoomImg = zoomOverlay.querySelector('img');
    zoomWrap.addEventListener('click', () => {
        const zoomed = zoomWrap.classList.toggle('zoomed');
        if (A && !reduceMotion) A({ targets: zoomImg, scale: zoomed ? 2.15 : 1, duration: 500, easing: 'easeOutExpo' });
    });
    zoomOverlay.querySelector('[data-close]').addEventListener('click', () => closeMx(zoomOverlay, zoomWrap));
    zoomOverlay.addEventListener('click', e => { if (e.target === zoomOverlay) closeMx(zoomOverlay, zoomWrap) });

    const videoOverlay = document.createElement('div');
    videoOverlay.className = 'mx-overlay';
    videoOverlay.innerHTML = '<button class="mx-close" data-close aria-label="Close">&times;</button><div class="mx-videowrap"><video controls playsinline></video></div>';
    document.body.appendChild(videoOverlay);
    const mxVideo = videoOverlay.querySelector('video');
    const mxVideoWrap = videoOverlay.querySelector('.mx-videowrap');
    const stopVideo = () => { mxVideo.pause(); mxVideo.removeAttribute('src'); mxVideo.load() };
    videoOverlay.querySelector('[data-close]').addEventListener('click', () => { stopVideo(); closeMx(videoOverlay, mxVideoWrap) });
    videoOverlay.addEventListener('click', e => { if (e.target === videoOverlay) { stopVideo(); closeMx(videoOverlay, mxVideoWrap) } });
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.mx-overlay.open').forEach(o => {
            stopVideo();
            closeMx(o, o.querySelector('.mx-videowrap, .mx-imgwrap, .enquiry-panel'));
        });
    });

    function openImageZoom(src, alt) {
        zoomImg.src = src; zoomImg.alt = alt || ''; zoomWrap.classList.remove('zoomed'); zoomImg.style.transform = '';
        openOverlay(zoomOverlay, zoomWrap);
    }
    function openVideo(src) { mxVideo.src = src; openOverlay(videoOverlay, mxVideoWrap); mxVideo.play().catch(() => { }) }

    document.querySelectorAll('.gallery-grid img, .detail-image img, .split-media img, .article img').forEach(img => {
        img.classList.add('zoomable');
        img.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openImageZoom(img.currentSrc || img.src, img.alt) });
    });

    /* ================= Video triggers per page (free stock video, Pexels) ================= */
    const VIDS = {
        interior1: 'https://videos.pexels.com/video-files/34593442/14659046_1440_2562_60fps.mp4',
        interior2: 'https://videos.pexels.com/video-files/33730467/14322174_1440_2560_24fps.mp4',
        exterior: 'https://videos.pexels.com/video-files/11446897/11446897-uhd_1440_2560_30fps.mp4'
    };
    const page = location.pathname.split('/').pop() || 'index.html';
    const videoConfig = {
        'index.html': { sel: '.split-media', video: VIDS.interior2, label: 'Watch the Paradise method' },
        'about.html': { sel: '.split-media', video: VIDS.interior1, label: 'Step inside our story' },
        'contact.html': { sel: '.split-media', video: VIDS.interior2, label: 'A look inside our office' },
        'journal.html': { sel: '.article.feature img', label: 'Watch the walkthrough', video: VIDS.interior1 },
        'property-sycamore.html': { sel: '.detail-image', video: VIDS.interior1, label: 'Watch video tour' },
        'property-harbor.html': { sel: '.detail-image', video: VIDS.interior2, label: 'Watch video tour' },
        'property-fernwood.html': { sel: '.detail-image', video: VIDS.interior1, label: 'Watch video tour' },
        'property-row.html': { sel: '.detail-image', video: VIDS.interior2, label: 'Watch video tour' }
    };
    const cfg = videoConfig[page] || (page.startsWith('property-') ? { sel: '.detail-image', video: VIDS.interior1, label: 'Watch video tour' } : null);
    const playIcon = '<div class="play-circle"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>';
    if (cfg) {
        let target = document.querySelector(cfg.sel);
        if (target) {
            if (target.tagName === 'IMG') {
                const wrap = document.createElement('div');
                wrap.style.position = 'relative'; wrap.style.overflow = 'hidden';
                target.parentNode.insertBefore(wrap, target);
                wrap.appendChild(target);
                target = wrap;
            }
            target.classList.add('video-trigger');
            const badge = document.createElement('div');
            badge.className = 'play-badge';
            badge.innerHTML = playIcon + `<span class="play-label">${cfg.label}</span>`;
            target.appendChild(badge);
            badge.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openVideo(cfg.video) });
            if (A && !reduceMotion) {
                const circle = badge.querySelector('.play-circle');
                A({ targets: circle, scale: [1, 1.1], duration: 1100, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
            }
        }
    }
    
    /* ================= Animated stat counters (anime.js number tween) ================= */
    document.querySelectorAll('.stat strong').forEach(el => {
        const raw = el.textContent.trim();
        const match = raw.match(/^([\d,]+)(.*)$/);
        if (!match) return;
        const target = parseInt(match[1].replace(/,/g, ''), 10);
        const suffix = match[2];
        if (isNaN(target)) return;
        el.textContent = '0' + suffix;
        const counterObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                counterObs.unobserve(el);
                if (reduceMotion) { el.textContent = raw; return }
                if (A) {
                    const counter = { val: 0 };
                    A({
                        targets: counter, val: target, round: 1, duration: 1600, easing: 'easeOutExpo',
                        update: () => { el.textContent = Math.round(counter.val).toLocaleString() + suffix }
                    });
                } else {
                    const dur = 1400, start = performance.now();
                    (function tick(now) {
                        const p = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - p, 3);
                        el.textContent = Math.round(target * eased).toLocaleString() + suffix;
                        if (p < 1) requestAnimationFrame(tick);
                    })(start);
                }
            });
        }, { threshold: .4 });
        counterObs.observe(el);
    });

    /* ================= Accessibility: label association, burger state, reduced-motion video ================= */
    let fid = 0;
    document.querySelectorAll('.field').forEach(fe => {
        const l = fe.querySelector('label'), c = fe.querySelector('input,select,textarea');
        if (l && c) { c.id = c.id || 'fld' + (++fid); l.htmlFor = c.id }
    });
    if (burger) burger.addEventListener('click', () => burger.setAttribute('aria-expanded', String(!!document.querySelector('.mobile-panel'))));
    if (reduceMotion) document.querySelectorAll('video').forEach(v => { v.removeAttribute('autoplay'); v.pause() });

    /* ================= Currency toggle (AED / USD, AED is pegged at 3.6725) ================= */
    const RATE = 3.6725; let cur = 'AED';
    try { cur = localStorage.getItem('pcur') || 'AED' } catch (e) { }
    const fmt = (n, usdStep = 1000) => cur === 'USD' ? '$' + (Math.round(n / RATE / usdStep) * usdStep).toLocaleString('en-US') : 'AED ' + Math.round(n).toLocaleString('en-US');
    const paintCur = () => {
        document.querySelectorAll('[data-aed]').forEach(e => e.textContent = fmt(+e.dataset.aed, +(e.dataset.step || 1000)) + (e.dataset.suffix || ''));
        document.querySelectorAll('[data-cur-toggle]').forEach(b => b.textContent = cur === 'AED' ? 'Show in USD' : 'Show in AED');
        document.dispatchEvent(new Event('curchange'));
    };
    document.querySelectorAll('[data-cur-toggle]').forEach(b => b.addEventListener('click', () => {
        cur = cur === 'AED' ? 'USD' : 'AED'; try { localStorage.setItem('pcur', cur) } catch (e) { } paintCur();
    }));

    /* ================= Mortgage estimate ================= */
    document.querySelectorAll('[data-calc]').forEach(c => {
        const price = +c.dataset.price, d = c.querySelector('[data-down]'), r = c.querySelector('[data-rate]'), t = c.querySelector('[data-term]'), out = c.querySelector('[data-pay]');
        const upd = () => {
            const loan = price * (1 - d.value / 100), i = r.value / 1200, n = t.value * 12;
            const pay = i ? loan * i / (1 - Math.pow(1 + i, -n)) : loan / n;
            c.querySelector('[data-o-down]').textContent = d.value + '%';
            c.querySelector('[data-o-rate]').textContent = Number(r.value).toFixed(1) + '%';
            c.querySelector('[data-o-term]').textContent = t.value + ' yrs';
            out.textContent = fmt(pay, 1) + ' / month';
            const rent = c.querySelector('[data-rent]'), y = c.querySelector('[data-yield]');
            if (rent && y) y.textContent = +rent.value > 0 ? 'Gross rental yield on your figure: ' + (rent.value / price * 100).toFixed(1) + '%' : '';
        };
        [d, r, t, c.querySelector('[data-rent]')].filter(Boolean).forEach(x => x.addEventListener('input', upd));
        document.addEventListener('curchange', upd); upd();
    });
    paintCur();

    /* ================= Compare (listings) ================= */
    const cmpCards = document.querySelectorAll('.all-listings .property-card');
    if (cmpCards.length) {
        let picks = [];
        const bar = document.createElement('div'); bar.className = 'cmp-bar'; bar.hidden = true;
        bar.innerHTML = '<span class="cmp-n"></span><button type="button" class="btn" data-cmp-open>Compare →</button><button type="button" class="cmp-clear" data-cmp-clear>Clear</button>';
        document.body.appendChild(bar);
        const ov = document.createElement('div'); ov.className = 'mx-overlay';
        ov.innerHTML = '<button class="mx-close" data-close aria-label="Close">&times;</button><div class="enquiry-panel cmp-panel"></div>';
        document.body.appendChild(ov);
        const panel = ov.querySelector('.cmp-panel');
        const paintCmp = () => {
            cmpCards.forEach(c => { const on = picks.includes(c), b = c.querySelector('.cmp-btn'); b.classList.toggle('on', on); b.textContent = on ? '✓ Comparing' : '+ Compare' });
            bar.hidden = !picks.length; bar.querySelector('.cmp-n').textContent = picks.length + ' / 3 selected';
            bar.querySelector('[data-cmp-open]').disabled = picks.length < 2;
        };
        cmpCards.forEach(c => {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'cmp-btn';
            b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); picks = picks.includes(c) ? picks.filter(x => x !== c) : (picks.length < 3 ? picks.concat(c) : picks); paintCmp() });
            c.appendChild(b);
        });
        bar.querySelector('[data-cmp-clear]').addEventListener('click', () => { picks = []; paintCmp() });
        bar.querySelector('[data-cmp-open]').addEventListener('click', () => {
            const rows = picks.map(c => ({ n: c.dataset.name, a: c.dataset.area, b: c.dataset.beds, ba: c.dataset.baths, sq: +c.dataset.sqft, p: +c.dataset.price, href: c.getAttribute('href') }));
            const best = Math.min(...rows.map(r => r.p / r.sq));
            const row = (label, fn) => '<tr><th>' + label + '</th>' + rows.map(r => '<td' + (label === 'Price / sqft' && r.p / r.sq === best ? ' class="best"' : '') + '>' + fn(r) + '</td>').join('') + '</tr>';
            panel.innerHTML = '<div class="eyebrow">Side by side</div><h2>Compare homes</h2><div class="cmp-scroll"><table class="cmp-table"><thead><tr><th></th>' + rows.map(r => '<th><a href="' + r.href + '">' + r.n + '</a></th>').join('') + '</tr></thead><tbody>'
                + row('Area', r => r.a) + row('Bedrooms', r => r.b) + row('Bathrooms', r => r.ba) + row('Size', r => r.sq.toLocaleString() + ' sqft')
                + row('Price', r => fmt(r.p)) + row('Price / sqft', r => fmt(r.p / r.sq, 1)) + '</tbody></table></div><p class="map-note">Highlighted cell = lowest price per square foot.</p>';
            openOverlay(ov, panel);
        });
        ov.querySelector('[data-close]').addEventListener('click', () => closeMx(ov, panel));
        ov.addEventListener('click', e => { if (e.target === ov) closeMx(ov, panel) });
        paintCmp();
    }

    /* ================= Viewing request -> WhatsApp ================= */
    document.querySelectorAll('[data-viewing]').forEach(form => {
        const d = form.querySelector('[data-date]'); if (d) d.min = new Date().toISOString().slice(0, 10);
        form.addEventListener('submit', e => {
            e.preventDefault();
            const v = Array.from(form.querySelectorAll('input,select')).map(x => x.value);
            const msg = 'Hello, I would like to book a viewing of ' + form.dataset.name + '.\nName: ' + v[0] + '\nPhone: ' + v[1] + '\nDate: ' + v[2] + '\nTime: ' + v[3];
            window.open('https://wa.me/' + PARADISE.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        });
    });

    /* ================= Demo pill ================= */
    if (PARADISE.demo && PARADISE.demo.enabled && !sessionStorage.getItem('demoHide')) {
        const pill = document.createElement('div'); pill.className = 'demo-pill';
        pill.innerHTML = '<span>Live demo · built by ' + PARADISE.demo.by + '</span>' + (PARADISE.demo.link ? '<a href="' + PARADISE.demo.link + '" target="_blank" rel="noopener">Talk to us</a>' : '') + '<button type="button" aria-label="Hide">&times;</button>';
        pill.querySelector('button').addEventListener('click', () => { pill.remove(); try { sessionStorage.setItem('demoHide', '1') } catch (e) { } });
        document.body.appendChild(pill);
    }

    /* ================= Card hover pop (anime.js) ================= */
    if (A && !reduceMotion) {
                document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
            btn.addEventListener('mouseenter', () => A({ targets: btn, scale: 1.045, duration: 300, easing: 'easeOutQuad' }));
            btn.addEventListener('mouseleave', () => A({ targets: btn, scale: 1, duration: 300, easing: 'easeOutQuad' }));
        });
    }

    /* ================= Subtle parallax on hero media ================= */
    if (!reduceMotion) {
        const heroMedia = document.querySelector('.hero-media');
        if (heroMedia) {
            addEventListener('scroll', () => {
                const y = Math.min(scrollY, 900);
                heroMedia.style.transform = `translateY(${y * 0.18}px)`;
            }, { passive: true });
        }
    }

    /* ================= Stagger reveal delays for grids (CSS fallback path) ================= */
    if (!A) {
        document.querySelectorAll('.listing-grid, .gallery-grid, .journal-grid .journal-side, .all-listings').forEach(grid => {
            Array.from(grid.children).forEach((child, i) => { child.style.transitionDelay = (i * 0.08) + 's' });
        });
    }
});

/* =========================================================
   PARADISE 3D LAYER — lightweight Three.js architectural scene
   ========================================================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  function loadThree(cb){
    if(window.THREE){cb();return}
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload=cb;s.onerror=()=>{};document.head.appendChild(s);
  }
  function addScene(host){
    if(!window.THREE || host.querySelector('.mx-3d-scene')) return;
    const wrap=document.createElement('div');wrap.className='mx-3d-scene';host.appendChild(wrap);
    const label=document.createElement('div');label.className='mx-3d-label';label.textContent='Interactive 3D architecture';host.appendChild(label);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(42,host.clientWidth/host.clientHeight,.1,100);camera.position.set(7,4.8,10);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(host.clientWidth,host.clientHeight);wrap.appendChild(renderer.domElement);
    const group=new THREE.Group();scene.add(group);
    const mat1=new THREE.MeshStandardMaterial({color:0x4de7ff,metalness:.55,roughness:.18,transparent:true,opacity:.8});
    const mat2=new THREE.MeshStandardMaterial({color:0x8c6cff,metalness:.35,roughness:.25,transparent:true,opacity:.7});
    const mat3=new THREE.MeshStandardMaterial({color:0xc8ff57,metalness:.2,roughness:.35,transparent:true,opacity:.65});
    const mats=[mat1,mat2,mat3];
    for(let i=0;i<14;i++){
      const w=.55+Math.random()*1.2,d=.55+Math.random()*1.2,h=1+Math.random()*5;
      const geo=new THREE.BoxGeometry(w,h,d);const mesh=new THREE.Mesh(geo,mats[i%3]);
      mesh.position.set((Math.random()-.5)*8,h/2-2,(Math.random()-.5)*5);mesh.rotation.y=(Math.random()-.5)*.35;group.add(mesh);
    }
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3.4,.035,12,100),new THREE.MeshBasicMaterial({color:0x4de7ff,transparent:true,opacity:.55}));ring.rotation.x=Math.PI/2.3;group.add(ring);
    const ring2=ring.clone();ring2.scale.setScalar(1.35);ring2.material=ring.material.clone();ring2.material.color.set(0xff6fb5);group.add(ring2);
    scene.add(new THREE.HemisphereLight(0xbbefff,0x111426,2.2));
    const light=new THREE.PointLight(0x8c6cff,18,30);light.position.set(3,7,5);scene.add(light);
    const light2=new THREE.PointLight(0x4de7ff,12,25);light2.position.set(-5,2,2);scene.add(light2);
    let tx=0,ty=0,rx=0,ry=0;
    host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5});
    function resize(){camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)}
    addEventListener('resize',resize,{passive:true});
    function frame(t){rx+=(ty*.35-rx)*.035;ry+=(tx*.45-ry)*.035;group.rotation.x=rx;group.rotation.y=ry+t*.00008;ring.rotation.z=t*.00018;ring2.rotation.z=-t*.00013;renderer.render(scene,camera);requestAnimationFrame(frame)}
    requestAnimationFrame(frame);
  }
  loadThree(()=>{
    document.querySelectorAll('.hero,.page-hero').forEach(addScene);
  });

  // Image-led project cards: per-card 3D tilt + scroll choreography + touch support.
  const projectCards=document.querySelectorAll('[data-3d-project]');
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const resetCard=(card)=>{
    card.style.setProperty('--mx','0');card.style.setProperty('--my','0');
    card.style.transform='';
    const media=card.querySelector('.atlas-media'),copy=card.querySelector('.atlas-copy'),link=card.querySelector('.atlas-link');
    if(media) media.style.transform='';
    if(copy) copy.style.transform='';
    if(link) link.style.transform='';
  };
  const pointCard=(card,x,y,source='pointer')=>{
    if(reduce)return;
    x=clamp(x,-.5,.5);y=clamp(y,-.5,.5);
    card.style.setProperty('--mx',x.toFixed(3));card.style.setProperty('--my',y.toFixed(3));
    if(source==='scroll')return;
    const media=card.querySelector('.atlas-media'),copy=card.querySelector('.atlas-copy'),link=card.querySelector('.atlas-link');
    const strength=window.innerWidth<700?4.5:10;
    card.style.transform=`perspective(1500px) rotateX(${(-y*strength).toFixed(2)}deg) rotateY(${(x*strength*1.15).toFixed(2)}deg) translate3d(${(x*5).toFixed(1)}px,${(y*-6).toFixed(1)}px,18px)`;
    if(media) media.style.transform=`translate3d(${(x*10).toFixed(1)}px,${(y*8).toFixed(1)}px,35px) rotateX(${(-y*2).toFixed(2)}deg) rotateY(${(x*3).toFixed(2)}deg)`;
    if(copy) copy.style.transform=`translate3d(${(x*-8).toFixed(1)}px,${(y*-5).toFixed(1)}px,80px) rotateY(${(x*1.8).toFixed(2)}deg)`;
    if(link) link.style.transform=`translate3d(${(x*12).toFixed(1)}px,${(y*10).toFixed(1)}px,120px) rotate(${(x*18).toFixed(1)}deg)`;
  };
  projectCards.forEach((card,i)=>{
    card.style.setProperty('--motion-delay',`${i*55}ms`);
    card.addEventListener('pointerdown',e=>{
      if(e.pointerType==='touch') card.setAttribute('data-touch-active','true');
    },{passive:true});
    card.addEventListener('pointermove',e=>{
      if(e.pointerType==='mouse' || e.pointerType==='pen' || e.pointerType==='touch'){
        const r=card.getBoundingClientRect();
        pointCard(card,(e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5,e.pointerType==='touch'?'touch':'pointer');
      }
    },{passive:true});
    card.addEventListener('pointerleave',()=>resetCard(card),{passive:true});
    card.addEventListener('pointerup',()=>{
      if(card.hasAttribute('data-touch-active')) setTimeout(()=>{card.removeAttribute('data-touch-active');resetCard(card)},220);
    },{passive:true});
    card.addEventListener('pointercancel',()=>{card.removeAttribute('data-touch-active');resetCard(card)},{passive:true});
  });

  // IntersectionObserver starts the unique entrance animation only when each image reaches the viewport.
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}
    }),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    projectCards.forEach(card=>io.observe(card));
  }else projectCards.forEach(card=>card.classList.add('is-visible'));

  // Scroll-driven depth: every card subtly reacts to its position on screen, including mobile.
  let raf=0;
  const updateProjectScroll=()=>{
    raf=0;if(reduce)return;
    projectCards.forEach(card=>{
      const r=card.getBoundingClientRect();
      if(r.bottom<0 || r.top>innerHeight) return;
      const center=r.top+r.height/2;
      const p=clamp((innerHeight/2-center)/(innerHeight/1.25),-1,1);
      card.style.setProperty('--scroll-p',p.toFixed(3));
      card.style.setProperty('--scroll-lift',`${(p*-12).toFixed(1)}px`);
      // Keep pointer transform if the user is interacting; otherwise give the card a gentle scroll tilt.
      if(!card.matches(':hover') && !card.hasAttribute('data-touch-active')){
        card.style.setProperty('--my',(p*.12).toFixed(3));
      }
    });
  };
  addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(updateProjectScroll)},{passive:true});
  addEventListener('resize',updateProjectScroll,{passive:true});
  updateProjectScroll();

  // Optional device-orientation enhancement on phones/tablets: no permission prompt is forced.
  if(!reduce && 'DeviceOrientationEvent' in window){
    addEventListener('deviceorientation',e=>{
      if(innerWidth>900 || e.gamma==null || e.beta==null)return;
      const gx=clamp(e.gamma/45,-1,1)*.22, gy=clamp((e.beta-45)/45,-1,1)*.18;
      projectCards.forEach(card=>{if(card.matches(':hover'))return;card.style.setProperty('--mx',gx.toFixed(3));card.style.setProperty('--my',gy.toFixed(3));});
    },{passive:true});
  }

  // Cursor-reactive 3D cards, intentionally different from standard hover effects.
  document.querySelectorAll('.property-card,.article,.value,.gallery-grid>*').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(window.innerWidth<901)return;
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg) translateZ(8px) translateY(-6px)`;
    });
    card.addEventListener('pointerleave',()=>{card.style.transform=''});
  });

  // Add depth to the page as the user scrolls.
  const depthTargets=document.querySelectorAll('.section,.split,.testimonial,.stats');
  const onScroll=()=>{
    const sy=scrollY;
    depthTargets.forEach((el,i)=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const p=(innerHeight-r.top)/(innerHeight+r.height);el.style.setProperty('--mx-depth',((p-.5)*10).toFixed(2)+'px')}});
  };
  addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
