/**
 * Thistlewood - Theme Switching & Interactive UI Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeLookbook();
  initializeSpotlight();
  initializeProductAccordions();
  initializeMobileMenu();
});

/**
 * Theme Toggle & Persistence on HTML root
 */
function initializeTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // Retrieve theme preference or default to daylight
  const currentTheme = localStorage.getItem('thistlewood_theme') || 'daylight';
  
  const scroller = document.querySelector('.lookbook-scroller-container');
  const spotlight = document.querySelector('.spotlight-hero-container');
  
  // Set initial element visibility based on stored preference
  if (currentTheme === 'evening') {
    document.documentElement.classList.add('theme-evening');
    if (scroller) scroller.parentElement.style.display = 'none';
    if (spotlight) spotlight.style.display = 'block';
  } else {
    document.documentElement.classList.remove('theme-evening');
    if (scroller) scroller.parentElement.style.display = 'flex';
    if (spotlight) spotlight.style.display = 'none';
  }

  // Handle switch click event
  toggleBtn.addEventListener('click', () => {
    const isEvening = document.documentElement.classList.toggle('theme-evening');
    localStorage.setItem('thistlewood_theme', isEvening ? 'evening' : 'daylight');
    
    if (isEvening) {
      if (scroller) scroller.parentElement.style.display = 'none';
      if (spotlight) spotlight.style.display = 'block';
    } else {
      if (scroller) scroller.parentElement.style.display = 'flex';
      if (spotlight) spotlight.style.display = 'none';
    }
  });
}

/**
 * Option A Lookbook Scroller Slides & Indicators (Continuous Forward Loop)
 */
function initializeLookbook() {
  const container = document.querySelector('.lookbook-scroller-container');
  const dots = document.querySelectorAll('.indicator-dot');
  if (!container || dots.length === 0) return;

  // Clone first slide and append it at the end to support seamless wrapping
  const slides = container.querySelectorAll('.lookbook-slide');
  if (slides.length > 0) {
    const firstClone = slides[0].cloneNode(true);
    container.appendChild(firstClone);
  }

  // Update indicators based on scroll position
  container.addEventListener('scroll', () => {
    const width = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const activeIndex = Math.round(scrollLeft / width);

    dots.forEach((dot, idx) => {
      // Wrap index so index 3 (clone) lights up indicator 0 (first slide)
      if (idx === (activeIndex % 3)) {
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

  // Autoplay slow loop lookbook slider (Daylight only)
  let autoPlayInterval = setInterval(autoSlide, 5000);

  function autoSlide() {
    if (document.documentElement.classList.contains('theme-evening')) return; // No auto-slide if evening is active
    
    const width = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - width;
    
    // We are at index 2 (slide 3) and about to scroll to index 3 (clone of slide 1)
    if (scrollLeft >= (maxScroll - width - 10)) {
      container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      // Once transition finishes, silently snap back to index 0
      setTimeout(() => {
        container.scrollTo({ left: 0, behavior: 'auto' });
      }, 700);
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
  const lens = document.querySelector('.spotlight-lens');
  if (!container || !lens) return;

  // Respect prefers-reduced-motion: if active, show static image and skip movement hooks
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    lens.style.opacity = 1;
    lens.style.webkitMaskImage = 'none';
    lens.style.maskImage = 'none';
    return;
  }

  // Track coordinates in real time
  container.addEventListener('mousemove', (e) => {
    if (!document.documentElement.classList.contains('theme-evening')) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    container.style.setProperty('--mouse-x', `${x}px`);
    container.style.setProperty('--mouse-y', `${y}px`);
    lens.style.opacity = 1;
  });

  // Touch support for mobile devices
  container.addEventListener('touchmove', (e) => {
    if (!document.documentElement.classList.contains('theme-evening')) return;
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const rect = container.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    container.style.setProperty('--mouse-x', `${x}px`);
    container.style.setProperty('--mouse-y', `${y}px`);
    lens.style.opacity = 1;
  }, { passive: true });

  // Disappear when mouse leaves
  container.addEventListener('mouseleave', () => {
    if (prefersReducedMotion) return;
    lens.style.opacity = 0;
  });
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
