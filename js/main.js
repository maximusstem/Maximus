/* =======================================================
   TEAM MAXIMUS — main.js
   Nav  |  Gallery  |  Contact  |  GSAP
   ======================================================= */

'use strict';

/* -------------------------------------------------------
   ELEMENT REFS
   ------------------------------------------------------- */
const navItems      = document.querySelectorAll('.nav-item');
const navHamburger  = document.getElementById('nav-hamburger');
const navMobileMenu = document.getElementById('nav-mobile-menu');

/* Boot GSAP as soon as scripts are ready */
waitForGSAP(initGSAP);


/* =======================================================
   NAVIGATION
   ======================================================= */
const sections = Array.from(document.querySelectorAll('section[id]'));

function updateActiveNav () {
    const mid = window.scrollY + window.innerHeight * 0.45;
    sections.forEach(sec => {
        if (mid >= sec.offsetTop && mid < sec.offsetTop + sec.offsetHeight) {
            navItems.forEach(n => n.classList.remove('active'));
            const match = document.querySelector(`.nav-item[href="#${sec.id}"]`);
            if (match) match.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

/* Smooth scroll for nav links */
navItems.forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const id     = item.getAttribute('href');
        const target = id && document.querySelector(id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        /* Close mobile menu if open */
        if (navMobileMenu) {
            navMobileMenu.classList.remove('open');
            if (navHamburger) {
                navHamburger.classList.remove('open');
                navHamburger.setAttribute('aria-expanded', 'false');
            }
        }
    });
});

/* Mobile hamburger */
if (navHamburger && navMobileMenu) {
    navHamburger.addEventListener('click', () => {
        const open = navMobileMenu.classList.toggle('open');
        navHamburger.classList.toggle('open', open);
        navHamburger.setAttribute('aria-expanded', String(open));
    });
    navMobileMenu.querySelectorAll('.nm-item').forEach(link => {
        link.addEventListener('click', () => {
            navMobileMenu.classList.remove('open');
            navHamburger.classList.remove('open');
            navHamburger.setAttribute('aria-expanded', 'false');
        });
    });
}


/* =======================================================
   DASHBOARD TAB SWITCHER
   ======================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.dt-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('dt-active'));
            tab.classList.add('dt-active');
        });
    });

    /* Sponsor logo onerror fallback */
    document.querySelectorAll('.sponsor-item img').forEach(img => {
        img.addEventListener('error', () => img.classList.add('error'));
    });

    initGallery();
    initContactForm();
});


/* =======================================================
   GALLERY — FILTER + LIGHTBOX
   ======================================================= */
function initGallery () {
    const grid    = document.getElementById('gallery-grid');
    const filters = document.querySelectorAll('.gf-btn');
    const items   = grid ? Array.from(grid.querySelectorAll('.gi')) : [];

    /* ---- Filter buttons ---- */
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('gf-active'));
            btn.classList.add('gf-active');

            const f = btn.dataset.filter;
            items.forEach(item => {
                const show = f === 'all' || item.dataset.filter === f;
                item.classList.toggle('gi-hidden', !show);
            });
        });
    });

    /* ---- Lightbox ---- */
    const glb     = document.getElementById('glb');
    const glbImg  = document.getElementById('glb-img');
    const glbCap  = document.getElementById('glb-cap');
    const glbBg   = glb && glb.querySelector('.glb-bg');
    const glbClose= glb && glb.querySelector('.glb-close');
    const glbPrev = glb && glb.querySelector('.glb-prev');
    const glbNext = glb && glb.querySelector('.glb-next');

    if (!glb) return;

    let currentLbIdx = 0;

    function openLightbox (idx) {
        currentLbIdx = idx;
        const item = items[idx];
        if (!item) return;
        glbImg.src = item.dataset.src || item.querySelector('img').src;
        glbImg.alt = item.querySelector('img').alt || '';
        glbCap.textContent = item.dataset.caption || '';
        glb.classList.add('glb-open');
        glb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox () {
        glb.classList.remove('glb-open');
        glb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function nextLightbox () {
        const visible = items.filter(i => !i.classList.contains('gi-hidden'));
        const curVis  = visible.indexOf(items[currentLbIdx]);
        const next    = visible[(curVis + 1) % visible.length];
        openLightbox(items.indexOf(next));
    }

    function prevLightbox () {
        const visible = items.filter(i => !i.classList.contains('gi-hidden'));
        const curVis  = visible.indexOf(items[currentLbIdx]);
        const prev    = visible[(curVis - 1 + visible.length) % visible.length];
        openLightbox(items.indexOf(prev));
    }

    items.forEach((item, i) => {
        const zoomBtn = item.querySelector('.gi-zoom');
        if (zoomBtn) zoomBtn.addEventListener('click', e => { e.stopPropagation(); openLightbox(i); });
        item.addEventListener('click', () => openLightbox(i));
    });

    if (glbBg)    glbBg.addEventListener('click',    closeLightbox);
    if (glbClose) glbClose.addEventListener('click', closeLightbox);
    if (glbNext)  glbNext.addEventListener('click',  nextLightbox);
    if (glbPrev)  glbPrev.addEventListener('click',  prevLightbox);

    document.addEventListener('keydown', e => {
        if (!glb.classList.contains('glb-open')) return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowRight') nextLightbox();
        if (e.key === 'ArrowLeft')  prevLightbox();
    });
}


/* =======================================================
   CONTACT FORM — CLIENT-SIDE VALIDATION
   ======================================================= */
function initContactForm () {
    const form    = document.getElementById('contact-form');
    const success = document.getElementById('cf-success');
    if (!form) return;

    function showErr (id, msg) {
        const el = document.getElementById(id);
        if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        let valid = true;

        const name  = document.getElementById('cf-name');
        const email = document.getElementById('cf-email');
        const msg   = document.getElementById('cf-msg');

        /* Reset */
        ['err-name','err-email','err-msg'].forEach(id => showErr(id, ''));

        if (!name || name.value.trim().length < 2) {
            showErr('err-name', 'Please enter your name (at least 2 characters).');
            valid = false;
        }

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRe.test(email.value.trim())) {
            showErr('err-email', 'Please enter a valid email address.');
            valid = false;
        }

        if (!msg || msg.value.trim().length < 10) {
            showErr('err-msg', 'Message must be at least 10 characters.');
            valid = false;
        }

        if (!valid) return;

        /* Simulate submission */
        const submitBtn = form.querySelector('.cf-submit');
        if (submitBtn) submitBtn.disabled = true;

        setTimeout(() => {
            form.reset();
            if (success) { success.style.display = 'flex'; }
            if (submitBtn) submitBtn.disabled = false;
            setTimeout(() => { if (success) success.style.display = 'none'; }, 5000);
        }, 600);
    });
}


/* =======================================================
   GSAP ANIMATIONS
   ======================================================= */
function waitForGSAP (cb) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        cb();
    } else {
        let attempts = 0;
        const id = setInterval(() => {
            attempts++;
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                clearInterval(id); cb();
            } else if (attempts > 40) clearInterval(id);
        }, 100);
    }
}

function initGSAP () {
    gsap.registerPlugin(ScrollTrigger);

    /* ------ HERO entrance ------ */
    const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTL
        .from('.hero-badge',     { opacity: 0, y: -18, duration: .45 })
        .from('.hn-team',        { opacity: 0, x: -60, duration: .55 }, '-=.15')
        .from('.hn-maximus',     { opacity: 0, x: -80, duration: .65 }, '-=.25')
        .from('.hero-tagline',   { opacity: 0, x: -40, duration: .45 }, '-=.25')
        .from(['.hr-black','.hr-red'], { scaleX: 0, duration: .4, stagger: .12, transformOrigin: 'left' }, '-=.2')
        .from('.hs-item',        { opacity: 0, y: 20, duration: .4, stagger: .1 }, '-=.15')
        .from('.hero-cta',       { opacity: 0, y: 16, duration: .4 }, '-=.1')
        .from('.hero-gif-frame', { opacity: 0, x: 70, duration: .7 }, '-=.75');

    /* ------ About ------ */
    gsap.from('.section-head', {
        scrollTrigger: { trigger: '#about', start: 'top 78%' },
        opacity: 0, y: 44, duration: .7, ease: 'power3.out',
    });
    gsap.from('.about-col-title, .about-body', {
        scrollTrigger: { trigger: '.about-story', start: 'top 85%' },
        opacity: 0, x: -36, stagger: .12, duration: .55, ease: 'power3.out',
    });
    gsap.from('.about-quote', {
        scrollTrigger: { trigger: '.about-quote', start: 'top 92%' },
        opacity: 0, x: -24, rotation: -2, duration: .5, ease: 'back.out(1.4)',
    });
    gsap.from('.driver-card', {
        scrollTrigger: { trigger: '.driver-cards', start: 'top 88%' },
        opacity: 0, x: 44, rotation: 1, stagger: .18, duration: .55, ease: 'power3.out',
    });
    gsap.from('.val-card', {
        scrollTrigger: { trigger: '.values-row', start: 'top 90%' },
        opacity: 0, y: 28, stagger: .1, duration: .5, ease: 'power2.out',
    });

    /* ------ Car dashboard ------ */
    gsap.from('#car .section-head', {
        scrollTrigger: { trigger: '#car', start: 'top 80%' },
        opacity: 0, y: 40, duration: .65, ease: 'power3.out',
    });
    gsap.from('.dash-topbar', {
        scrollTrigger: { trigger: '.dash-topbar', start: 'top 88%' },
        opacity: 0, y: -18, duration: .45, ease: 'power3.out',
    });
    gsap.from('.dash-card', {
        scrollTrigger: { trigger: '.dash-grid', start: 'top 85%' },
        opacity: 0, y: 30, stagger: .1, duration: .55, ease: 'power3.out',
    });
    gsap.fromTo('.ders-fill',
        { width: '0%' },
        { scrollTrigger: { trigger: '.ders-wrap', start: 'top 90%' }, width: '68%', duration: 1.3, ease: 'power2.out' }
    );
    gsap.fromTo('.dlap-bar-fill',
        { width: '0%' },
        { scrollTrigger: { trigger: '.dlap-bar-track', start: 'top 90%' }, width: '73.7%', duration: 1.1, ease: 'power2.out' }
    );
    gsap.from('.rpm-arc-red', {
        scrollTrigger: { trigger: '.rpm-svg', start: 'top 90%' },
        strokeDasharray: '0 252', duration: 1.5, ease: 'power2.inOut',
    });

    /* ------ Sponsors ------ */
    gsap.from('#sponsors .section-head', {
        scrollTrigger: { trigger: '#sponsors', start: 'top 80%' },
        opacity: 0, y: 36, duration: .6, ease: 'power3.out',
    });
    gsap.from('.sponsors-tagline', {
        scrollTrigger: { trigger: '.sponsors-tagline', start: 'top 92%' },
        opacity: 0, y: 16, duration: .45, ease: 'power2.out',
    });

    /* ------ Gallery ------ */
    gsap.from('#gallery .section-head', {
        scrollTrigger: { trigger: '#gallery', start: 'top 80%' },
        opacity: 0, y: 36, duration: .6, ease: 'power3.out',
    });
    gsap.from('.gallery-filters', {
        scrollTrigger: { trigger: '.gallery-filters', start: 'top 90%' },
        opacity: 0, y: 16, duration: .4, ease: 'power2.out',
    });
    gsap.from('.gi', {
        scrollTrigger: { trigger: '.gallery-grid', start: 'top 85%' },
        opacity: 0, y: 30, stagger: .07, duration: .5, ease: 'power2.out',
    });

    /* ------ Contact ------ */
    gsap.from('#contact .section-head', {
        scrollTrigger: { trigger: '#contact', start: 'top 80%' },
        opacity: 0, y: 36, duration: .6, ease: 'power3.out',
    });
    gsap.from('.contact-form-wrap', {
        scrollTrigger: { trigger: '.contact-grid', start: 'top 85%' },
        opacity: 0, x: -40, duration: .6, ease: 'power3.out',
    });
    gsap.from('.contact-info', {
        scrollTrigger: { trigger: '.contact-grid', start: 'top 85%' },
        opacity: 0, x: 40, duration: .6, ease: 'power3.out',
    });
}
