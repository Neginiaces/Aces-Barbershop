/**
 * Aces Barbershop — Motion + GSAP
 * Rich page-load, scroll, and interaction animations.
 * (Motion = vanilla Framer Motion family; Framer Motion itself is React-only.)
 */

import { animate, stagger, hover } from 'https://esm.sh/motion@12.23.12';
import gsap from 'https://esm.sh/gsap@3.12.7';
import { ScrollTrigger } from 'https://esm.sh/gsap@3.12.7/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut = [0.16, 1, 0.3, 1];

document.documentElement.classList.add('js-ready');

/* Failsafe: never leave hero/content invisible if CDN/modules fail */
window.setTimeout(() => {
  document.querySelectorAll('.hero-logo-animate, .hero-animate').forEach((el) => {
    if (getComputedStyle(el).opacity === '0') {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
    }
  });
}, 3500);

/* ------------------------------------------------------------------
   Utilities
   ------------------------------------------------------------------ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

function headerOffset() {
  return (
    (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64) +
    (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--promo-height')) || 34) +
    12
  );
}

/* ------------------------------------------------------------------
   Navigation
   ------------------------------------------------------------------ */
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

function closeNav() {
  if (!navToggle || !siteNav) return;
  navToggle.setAttribute('aria-expanded', 'false');
  siteNav.classList.remove('open');
  document.body.classList.remove('nav-open');
  document.body.style.overflow = '';
}

function openNav() {
  if (!navToggle || !siteNav) return;
  navToggle.setAttribute('aria-expanded', 'true');
  siteNav.classList.add('open');
  document.body.classList.add('nav-open');
  document.body.style.overflow = 'hidden';
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeNav();
    } else {
      openNav();
    }
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !navToggle || !siteNav) return;
  if (navToggle.getAttribute('aria-expanded') === 'true') {
    closeNav();
    navToggle.focus();
  }
});

const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();

    if (prefersReducedMotion) {
      window.scrollTo(0, top);
    } else {
      window.scrollTo({ top, behavior: 'smooth' });
    }

    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

/* ------------------------------------------------------------------
   FAQ
   ------------------------------------------------------------------ */
document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    const answer = document.getElementById(button.getAttribute('aria-controls'));

    document.querySelectorAll('.faq-question').forEach((other) => {
      if (other === button) return;
      other.setAttribute('aria-expanded', 'false');
      const otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
      if (otherAnswer) {
        if (!prefersReducedMotion && !otherAnswer.hidden) {
          gsap.to(otherAnswer, {
            height: 0,
            opacity: 0,
            duration: 0.28,
            ease: 'power2.inOut',
            onComplete: () => {
              otherAnswer.hidden = true;
              gsap.set(otherAnswer, { clearProps: 'height,opacity' });
            },
          });
        } else {
          otherAnswer.hidden = true;
        }
      }
    });

    button.setAttribute('aria-expanded', String(!expanded));

    if (!answer) return;

    if (expanded) {
      if (!prefersReducedMotion) {
        gsap.to(answer, {
          height: 0,
          opacity: 0,
          duration: 0.28,
          ease: 'power2.inOut',
          onComplete: () => {
            answer.hidden = true;
            gsap.set(answer, { clearProps: 'height,opacity' });
          },
        });
      } else {
        answer.hidden = true;
      }
    } else {
      answer.hidden = false;
      if (!prefersReducedMotion) {
        gsap.fromTo(
          answer,
          { height: 0, opacity: 0 },
          {
            height: 'auto',
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
          }
        );
      }
    }
  });
});

/* ------------------------------------------------------------------
   Contact form
   ------------------------------------------------------------------ */
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.querySelector('#name');
    const email = contactForm.querySelector('#email');
    const message = contactForm.querySelector('#message');
    const status = contactForm.querySelector('.form-note');
    let valid = true;

    [name, email, message].forEach((field) => {
      if (field && !field.value.trim()) {
        valid = false;
        field.setAttribute('aria-invalid', 'true');
      } else if (field) {
        field.removeAttribute('aria-invalid');
      }
    });

    if (email?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      valid = false;
      email.setAttribute('aria-invalid', 'true');
    }

    if (status) {
      if (valid) {
        status.textContent = 'Thank you! Your message has been received. We will respond shortly.';
        contactForm.reset();
        if (!prefersReducedMotion) {
          animate(status, { opacity: [0, 1], y: [8, 0] }, { duration: 0.4 });
        }
      } else {
        status.textContent = 'Please fill in all required fields correctly.';
      }
    }
  });
}

/* ------------------------------------------------------------------
   Reduced motion: show everything, skip cinematic motion
   ------------------------------------------------------------------ */
if (prefersReducedMotion) {
  document.querySelectorAll('.hero-logo-animate, .hero-animate, .reveal').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.filter = 'none';
  });
} else {
  initRichMotion();
}

function initRichMotion() {
  document.querySelectorAll('.hero-logo-animate, .hero-animate').forEach((el) => {
    el.style.animation = 'none';
    el.style.opacity = '0';
  });

  /* ---- Page enter: promo + header ---- */
  gsap.from(['.promo-banner', '.site-header'], {
    y: (i) => (i === 0 ? -40 : -24),
    opacity: 0,
    duration: 0.85,
    stagger: 0.08,
    ease: 'power3.out',
  });

  /* ---- Desktop nav links ---- */
  const navLinks = document.querySelectorAll('.nav-list a');
  if (navLinks.length && window.matchMedia('(min-width: 64rem)').matches) {
    gsap.from(navLinks, {
      opacity: 0,
      y: -10,
      duration: 0.55,
      stagger: 0.05,
      delay: 0.35,
      ease: 'power2.out',
    });
  }

  /* ---- Hero logo (Motion) ---- */
  const logo = document.querySelector('.hero-logo');
  if (logo) {
    animate(
      logo,
      {
        opacity: [0, 1],
        scale: [0.88, 1],
        y: [32, 0],
        filter: ['blur(12px)', 'blur(0px)'],
      },
      { duration: 1.25, easing: easeOut, delay: 0.12 }
    );
  }

  const memorial = document.querySelector('.hero-memorial');
  if (memorial && !prefersReducedMotion) {
    gsap.from(memorial, {
      opacity: 0,
      y: 10,
      duration: 0.8,
      delay: 0.35,
      ease: 'power2.out',
    });
  }

  const actions = document.querySelector('.hero-actions');
  if (actions) {
    animate(
      actions,
      { opacity: [0, 1], y: [14, 0] },
      { duration: 0.55, easing: easeOut, delay: 0.35 }
    );
  }

  /* ---- Section headers ---- */
  gsap.utils.toArray('.section-header').forEach((headerEl) => {
    const parts = headerEl.querySelectorAll('.section-eyebrow, .section-title, .section-desc');
    gsap.from(parts, {
      scrollTrigger: { trigger: headerEl, start: 'top 85%', once: true },
      opacity: 0,
      y: 36,
      duration: 0.85,
      stagger: 0.1,
      ease: 'power3.out',
    });
  });

  /* ---- Stats + counters ---- */
  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid) {
    gsap.from('.stat-item', {
      scrollTrigger: {
        trigger: statsGrid,
        start: 'top 80%',
        once: true,
        onEnter: () => animateCounters(),
      },
      opacity: 0,
      y: 40,
      scale: 0.96,
      duration: 0.75,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }

  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.floor(obj.val).toLocaleString('en-CA') + suffix;
        },
        onComplete: () => {
          el.textContent = target.toLocaleString('en-CA') + suffix;
        },
      });
    });
  }

  /* ---- Staggered card grids ---- */
  const staggerGroups = [
    { sel: '.services-grid', child: '.service-card' },
    { sel: '.team-grid', child: '.team-card' },
    { sel: '.testimonials-grid', child: '.testimonial' },
    { sel: '.shop-grid', child: '.shop-item' },
    { sel: '.faq-list', child: '.faq-item' },
    { sel: '.contact-info', child: '.contact-card' },
  ];

  staggerGroups.forEach(({ sel, child }) => {
    const grid = document.querySelector(sel);
    if (!grid) return;
    const items = grid.querySelectorAll(child);
    if (!items.length) return;

    gsap.from(items, {
      scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
      opacity: 0,
      y: 48,
      scale: 0.97,
      duration: 0.8,
      stagger: 0.09,
      ease: 'power3.out',
    });
  });

  /* ---- Team photo scale-in inside cards ---- */
  document.querySelectorAll('.team-photo').forEach((photo) => {
    gsap.from(photo, {
      scrollTrigger: { trigger: photo, start: 'top 88%', once: true },
      scale: 1.08,
      duration: 1.2,
      ease: 'power2.out',
    });
  });

  /* ---- About split + image clip reveal ---- */
  const about = document.querySelector('.about-grid');
  if (about) {
    const visual = about.querySelector('.about-visual');
    const content = about.querySelector('.about-content');
    const aboutImg = about.querySelector('.about-image');

    if (visual) {
      gsap.from(visual, {
        scrollTrigger: { trigger: about, start: 'top 78%', once: true },
        opacity: 0,
        x: -48,
        duration: 1.05,
        ease: 'power3.out',
      });
    }

    if (aboutImg) {
      gsap.fromTo(
        aboutImg,
        { clipPath: 'inset(12% 12% 12% 12%)', scale: 1.06 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          duration: 1.35,
          ease: 'power3.out',
          scrollTrigger: { trigger: about, start: 'top 78%', once: true },
        }
      );
    }

    if (content) {
      gsap.from(content.children, {
        scrollTrigger: { trigger: about, start: 'top 78%', once: true },
        opacity: 0,
        x: 36,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.12,
      });
    }
  }

  /* ---- Shop images soft zoom ---- */
  document.querySelectorAll('.shop-item img').forEach((img) => {
    gsap.from(img, {
      scrollTrigger: { trigger: img.closest('.shop-item') || img, start: 'top 88%', once: true },
      scale: 1.1,
      duration: 1.15,
      ease: 'power2.out',
    });
  });

  /* ---- Booking / map / contact panels ---- */
  ['.booking-wrap', '.map-wrap', '.contact-form', '.shop-cta', '.map-cta', '.booking-note'].forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: 'power3.out',
    });
  });

  /* ---- Contact page hero ---- */
  const pageHero = document.querySelector('.page-hero');
  if (pageHero) {
    gsap.from(pageHero.children, {
      opacity: 0,
      y: 28,
      duration: 0.85,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.15,
    });
  }

  /* ---- Footer ---- */
  const footer = document.querySelector('.site-footer');
  if (footer) {
    gsap.from('.footer-grid > *', {
      scrollTrigger: { trigger: footer, start: 'top 90%', once: true },
      opacity: 0,
      y: 28,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out',
    });
  }

  /* ---- Subtle parallax on about image ---- */
  const aboutImgParallax = document.querySelector('.about-image');
  if (aboutImgParallax) {
    gsap.to(aboutImgParallax, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-visual',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  /* ---- Soft section fade as they enter ---- */
  gsap.utils.toArray('.section').forEach((section) => {
    if (section.classList.contains('hero')) return;
    gsap.from(section, {
      scrollTrigger: { trigger: section, start: 'top 92%', once: true },
      opacity: 0.35,
      duration: 0.7,
      ease: 'power1.out',
    });
  });

  /* ---- Hover lift (Motion) ---- */
  document.querySelectorAll('.service-card, .team-card, .testimonial, .shop-item, .contact-card').forEach((card) => {
    hover(card, (el) => {
      animate(el, { y: -5, scale: 1.012 }, { duration: 0.38, easing: easeOut });
      return () => animate(el, { y: 0, scale: 1 }, { duration: 0.42, easing: easeOut });
    });
  });

  /* ---- Primary CTA hover glow ---- */
  document.querySelectorAll('.btn-primary').forEach((btn) => {
    hover(btn, (el) => {
      animate(el, { scale: 1.03 }, { duration: 0.3, easing: easeOut });
      return () => animate(el, { scale: 1 }, { duration: 0.35, easing: easeOut });
    });
  });

  /* ---- Button press micro-feedback ---- */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('pointerdown', () => {
      animate(btn, { scale: 0.97 }, { duration: 0.12 });
    });
    btn.addEventListener('pointerup', () => {
      animate(btn, { scale: 1 }, { duration: 0.25, easing: easeOut });
    });
    btn.addEventListener('pointerleave', () => {
      animate(btn, { scale: 1 }, { duration: 0.25 });
    });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}
