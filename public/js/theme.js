/**
 * Maison Éther - Theme Switching & Interactive UI Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeLookbook();
  initializeSpotlight();
  initializeProductAccordions();
  initializeMobileMenu();
});

/**
 * Theme Toggle & Persistence
 */
function initializeTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // Retrieve theme preference or default to quiet-luxury
  const currentTheme = localStorage.getItem('maison_ether_theme') || 'quiet-luxury';
  
  if (currentTheme === 'dark-atelier') {
    document.body.classList.add('theme-dark-atelier');
  } else {
    document.body.classList.remove('theme-dark-atelier');
  }

  // Handle switch click event
  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('theme-dark-atelier');
    localStorage.setItem('maison_ether_theme', isDark ? 'dark-atelier' : 'quiet-luxury');
    
    // Rerender layout updates or elements if on index page
    const scroller = document.querySelector('.lookbook-scroller-container');
    const spotlight = document.querySelector('.spotlight-hero-container');
    
    if (isDark) {
      if (scroller) scroller.parentElement.style.display = 'none';
      if (spotlight) spotlight.style.display = 'block';
    } else {
      if (scroller) scroller.parentElement.style.display = 'flex';
      if (spotlight) spotlight.style.display = 'none';
    }
  });
}

/**
 * Option A Lookbook Scroller Slides & Indicators
 */
function initializeLookbook() {
  const container = document.querySelector('.lookbook-scroller-container');
  const dots = document.querySelectorAll('.indicator-dot');
  if (!container || dots.length === 0) return;

  // Update indicators based on scroll position
  container.addEventListener('scroll', () => {
    const width = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const activeIndex = Math.round(scrollLeft / width);

    dots.forEach((dot, idx) => {
      if (idx === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  });

  // Dots click triggering smooth snap scroll
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      const width = container.clientWidth;
      container.scrollTo({
        left: width * idx,
        behavior: 'smooth'
      });
    });
  });

  // Autoplay slow loop lookbook slider (Theme A only)
  let autoPlayInterval = setInterval(autoSlide, 6500);

  function autoSlide() {
    if (document.body.classList.contains('theme-dark-atelier')) return; // No auto-slide if dark atelier is active
    
    const width = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - width;
    
    if (scrollLeft >= maxScroll - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: width, behavior: 'smooth' });
    }
  }

  // Clear autoplay when interacted with
  container.addEventListener('touchstart', () => clearInterval(autoPlayInterval), { passive: true });
  dots.forEach(dot => dot.addEventListener('click', () => clearInterval(autoPlayInterval)));
}

/**
 * Option B Spotlight Texture Mask Reveal (Cursor following effect)
 */
function initializeSpotlight() {
  const container = document.querySelector('.spotlight-hero-container');
  if (!container) return;

  // Mousemove coordinates mapping
  container.addEventListener('mousemove', (e) => {
    if (!document.body.classList.contains('theme-dark-atelier')) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    container.style.setProperty('--mouse-x', `${x}%`);
    container.style.setProperty('--mouse-y', `${y}%`);
  });

  // Handle Touch devices by center pulsing spotlight in key spots or tracking finger
  container.addEventListener('touchmove', (e) => {
    if (!document.body.classList.contains('theme-dark-atelier')) return;
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const rect = container.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    container.style.setProperty('--mouse-x', `${x}%`);
    container.style.setProperty('--mouse-y', `${y}%`);
  }, { passive: true });
}

/**
 * Care, Sizing, and Shipping accordions on Product details
 */
function initializeProductAccordions() {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close other headers
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initializeMobileMenu() {
  const toggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isVisible = nav.style.display === 'flex';
    if (isVisible) {
      nav.style.display = 'none';
      toggle.innerHTML = '&#9776;'; // Hamburger character
    } else {
      nav.style.display = 'flex';
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.top = '80px';
      nav.style.left = '0';
      nav.style.width = '100%';
      nav.style.backgroundColor = 'var(--bg-color)';
      nav.style.borderBottom = '1px solid var(--border-color)';
      nav.style.padding = '20px';
      nav.style.gap = '20px';
      toggle.innerHTML = '&times;'; // Cross character
    }
  });
}
