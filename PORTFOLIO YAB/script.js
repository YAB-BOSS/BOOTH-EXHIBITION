// ─── i18n ENGINE ───
let currentLang = 'en';

function detectLanguage() {
  const browserLang = (navigator.language || navigator.userLanguage || 'en').slice(0, 2).toLowerCase();
  return LANGUAGES[browserLang] ? browserLang : 'en';
}

function setLanguage(lang) {
  currentLang = lang;
  const langData = T[lang];
  if (!langData) return;

  // Set direction
  document.documentElement.dir = LANGUAGES[lang].rtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;

  // Translate all elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (langData[key]) el.innerHTML = langData[key];
  });

  // Update lang button
  document.getElementById('currentLang').textContent = LANGUAGES[lang].flag + ' ' + lang.toUpperCase();

  // Update active state in dropdown
  document.querySelectorAll('.lang-dropdown button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  localStorage.setItem('yab_lang', lang);
}

function buildLangDropdown() {
  const dropdown = document.getElementById('langDropdown');
  dropdown.innerHTML = '';
  Object.entries(LANGUAGES).forEach(([code, info]) => {
    const btn = document.createElement('button');
    btn.dataset.lang = code;
    btn.textContent = info.flag + ' ' + info.name;
    btn.onclick = (e) => { e.stopPropagation(); setLanguage(code); dropdown.classList.remove('open'); };
    if (code === currentLang) btn.classList.add('active');
    dropdown.appendChild(btn);
  });
}

// ─── NAVBAR ───
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const langBtn = document.getElementById('langBtn');
const langDropdown = document.getElementById('langDropdown');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// Language dropdown toggle
langBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  langDropdown.classList.toggle('open');
});

document.addEventListener('click', () => {
  langDropdown.classList.remove('open');
});

// ─── ANIMATED COUNTERS ───
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = target >= 40 ? '+' : '+';
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, 25);
  });
}

// ─── INTERSECTION OBSERVER ───
let countersAnimated = false;
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Trigger counters when hero stats come into view
      if (!countersAnimated && entry.target.closest('.hero')) {
        countersAnimated = true;
        animateCounters();
      }
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── ACTIVE NAV LINK ON SCROLL ───
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

// ─── LIGHTBOX ───
function openLightbox(item) {
  const img = item.querySelector('img');
  document.getElementById('lightboxImg').src = img.src;
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ─── CONTACT FORM (FORMSPREE AJAX) ───
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const successMsg = document.getElementById('formSuccess');

  // Disable button and show sending state
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Sending… <i class="fas fa-spinner fa-spin"></i>';

  // Collect all named fields into a plain object for JSON
  const formData = new FormData(form);
  const payload = {};
  formData.forEach((value, key) => { payload[key] = value; });

  // POST to Formspree — Accept: application/json prevents page redirect
  fetch('https://formspree.io/f/YOUR_ID_HERE', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        // ✅ Success — show inline message, reset form
        successMsg.style.display = 'block';
        form.reset();
        setTimeout(() => { successMsg.style.display = 'none'; }, 10000);
      } else {
        // Formspree returned an error (e.g. unactivated endpoint)
        const errMsg = data.errors?.map(err => err.message).join(', ') || 'Submission failed.';
        alert('Error: ' + errMsg + '\nPlease email yabdesigns@gmail.com directly.');
      }
    })
    .catch(error => {
      console.error('Form submission error:', error);
      alert('Sorry, there was a network error. Please email yabdesigns@gmail.com directly.');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = (T[currentLang]?.form_submit || 'Send Message') + ' <i class="fas fa-paper-plane"></i>';
    });
});

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  buildLangDropdown();
  const savedLang = localStorage.getItem('yab_lang');
  const lang = savedLang || detectLanguage();
  setLanguage(lang);

  // Trigger hero animation immediately
  document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
  setTimeout(() => { if (!countersAnimated) { countersAnimated = true; animateCounters(); } }, 800);
});
