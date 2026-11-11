const header = document.querySelector('[data-header]');
const progress = document.querySelector('.reading-progress span');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const search = document.querySelector('[data-wiki-search]');
const wikiCards = [...document.querySelectorAll('.wiki-card')];
const filterButtons = [...document.querySelectorAll('[data-wiki-filter]')];
const emptyState = document.querySelector('.wiki-empty');

const normalize = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

function updateChrome() {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  header?.classList.toggle('scrolled', scrollTop > 24);
  if (progress) progress.style.width = `${height > 0 ? (scrollTop / height) * 100 : 0}%`;
}

function closeMenu() {
  nav?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', updateChrome, { passive: true });
updateChrome();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
}

function applyWikiFilter() {
  const activeCategory = document.querySelector('[data-wiki-filter].active')?.dataset.wikiFilter || 'all';
  const term = normalize(search?.value || '');
  let visibleCount = 0;

  wikiCards.forEach((card) => {
    const categories = card.dataset.category?.split(' ') || [];
    const searchable = normalize(`${card.textContent} ${card.dataset.keywords || ''}`);
    const categoryMatch = activeCategory === 'all' || categories.includes(activeCategory);
    const searchMatch = !term || searchable.includes(term);
    const visible = categoryMatch && searchMatch;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (emptyState) emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    applyWikiFilter();
  });
});

search?.addEventListener('input', applyWikiFilter);
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== search) {
    event.preventDefault();
    search?.focus();
  }
  if (event.key === 'Escape') {
    closeMenu();
    if (document.activeElement === search) search.blur();
  }
});

document.querySelectorAll('.faq-list details').forEach((details) => {
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    document.querySelectorAll('.faq-list details[open]').forEach((other) => {
      if (other !== details) other.open = false;
    });
  });
});
