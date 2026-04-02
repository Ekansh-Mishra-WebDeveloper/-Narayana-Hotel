// index.js
document.addEventListener('DOMContentLoaded', () => {
  // ========== STICKY NAVBAR ==========
  const navbar = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // ========== MOBILE MENU ==========
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileOverlay = document.getElementById('mobileMenuOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const mobileBookBtn = document.querySelector('.mobile-book-btn');
  function openMobileMenu() {
    mobileOverlay.classList.add('active');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
  mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
          closeMobileMenu();
        }
      }
    });
  });
  if (mobileBookBtn) {
    mobileBookBtn.addEventListener('click', () => {
      alert('Thank you for your interest! Our concierge will reach out shortly.');
      closeMobileMenu();
    });
  }

  // ========== SMOOTH SCROLL DESKTOP ==========
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetSection = document.querySelector(targetId);
        if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ========== BOOK NOW ALERTS ==========
  const allBookBtns = document.querySelectorAll('.book-now-btn, .book-now-cta, .explore-menu-btn, .book-venue-btn, .btn-book-now, .book-room-btn');
  allBookBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      let message = 'Thank you for your interest! Our concierge will reach out shortly.';
      if (btn.classList.contains('explore-menu-btn')) message = 'Explore our exquisite dining menu soon!';
      if (btn.classList.contains('book-venue-btn')) message = 'Event booking request received. Our team will contact you.';
      alert(message);
    });
  });

  // ========== SLIDER INITIALIZATION (reusable) ==========
  function initSlider(sliderContainer, slideInterval = 3000, isVideoSlider = false) {
    const track = sliderContainer.querySelector('.slider-track');
    const dotsContainer = sliderContainer.querySelector('.slider-dots');
    if (!track || !dotsContainer) return;
    const items = track.children; // img or video elements
    const total = items.length;
    if (total === 0) return;

    let currentIndex = 0;
    let autoInterval;
    let videoEndHandler = null;

    // Create dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        stopAuto();
        goToSlide(i);
        startAuto();
      });
      dotsContainer.appendChild(dot);
    }

    function goToSlide(index) {
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
        if (i === currentIndex) dot.classList.add('active');
        else dot.classList.remove('active');
      });
      // For video sliders, manage play/pause
      if (isVideoSlider) {
        Array.from(items).forEach((video, i) => {
          if (video.tagName === 'VIDEO') {
            if (i === currentIndex) {
              video.muted = sliderContainer.dataset.muted === 'true' ? true : false;
              video.play().catch(e => console.log('autoplay blocked'));
            } else {
              video.pause();
            }
          }
        });
      }
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % total;
      goToSlide(currentIndex);
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + total) % total;
      goToSlide(currentIndex);
    }

    const prevBtn = sliderContainer.querySelector('.slider-prev');
    const nextBtn = sliderContainer.querySelector('.slider-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stopAuto();
        prevSlide();
        startAuto();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stopAuto();
        nextSlide();
        startAuto();
      });
    }

    function startAuto() {
      if (autoInterval) clearInterval(autoInterval);
      autoInterval = setInterval(nextSlide, slideInterval);
    }
    function stopAuto() {
      if (autoInterval) clearInterval(autoInterval);
    }

    // For video sliders, also listen for video end to advance
    if (isVideoSlider) {
      const currentVideo = items[currentIndex];
      if (currentVideo && currentVideo.tagName === 'VIDEO') {
        if (videoEndHandler) currentVideo.removeEventListener('ended', videoEndHandler);
        videoEndHandler = () => { nextSlide(); };
        currentVideo.addEventListener('ended', videoEndHandler);
      }
      // Update video end listener on each slide change
      const originalGoToSlide = goToSlide;
      goToSlide = (index) => {
        if (videoEndHandler && items[currentIndex] && items[currentIndex].tagName === 'VIDEO') {
          items[currentIndex].removeEventListener('ended', videoEndHandler);
        }
        originalGoToSlide(index);
        const newVideo = items[currentIndex];
        if (newVideo && newVideo.tagName === 'VIDEO') {
          newVideo.addEventListener('ended', videoEndHandler);
          if (newVideo.paused && sliderContainer.dataset.muted === 'true') {
            newVideo.play().catch(e => console.log('play failed'));
          }
        }
      };
    }

    startAuto();
    sliderContainer.addEventListener('mouseenter', stopAuto);
    sliderContainer.addEventListener('mouseleave', startAuto);
    window.addEventListener('resize', () => { goToSlide(currentIndex); });
  }

  // Initialize all room sliders (existing)
  document.querySelectorAll('.room-slider').forEach(slider => initSlider(slider, 3000, false));
  // Initialize booking section sliders
  document.querySelectorAll('.booking-slider').forEach(slider => initSlider(slider, 3000, false));
  // Initialize gallery image slider
  const gallerySlider = document.querySelector('.image-gallery-slider');
  if (gallerySlider) initSlider(gallerySlider, 3000, false);
  // Initialize video reels slider
  const videoSlider = document.querySelector('.video-reels-slider');
  if (videoSlider) {
    initSlider(videoSlider, 3000, true);
    // Mute/unmute toggle
    const muteBtn = videoSlider.querySelector('.mute-toggle');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const videos = videoSlider.querySelectorAll('video');
        const currentlyMuted = videos[0]?.muted;
        videos.forEach(v => v.muted = !currentlyMuted);
        muteBtn.innerHTML = currentlyMuted ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        videoSlider.dataset.muted = (!currentlyMuted).toString();
      });
      videoSlider.dataset.muted = 'true';
    }
  }

  // ========== REVIEWS SLIDER (with avatars) ==========
  const reviewTrack = document.getElementById('reviewTrack');
  const reviewPrev = document.querySelector('.prev-review');
  const reviewNext = document.querySelector('.next-review');
  const reviewDotsContainer = document.getElementById('reviewDots');
  let reviewSlides = reviewTrack ? Array.from(reviewTrack.children) : [];
  let reviewIndex = 0;
  let reviewAutoInterval;

  function updateReviewSlider() {
    if (!reviewSlides.length) return;
    const slideW = reviewSlides[0].getBoundingClientRect().width;
    reviewTrack.style.transform = `translateX(-${reviewIndex * slideW}px)`;
    Array.from(reviewDotsContainer.children).forEach((dot, i) => {
      if (i === reviewIndex) dot.classList.add('active-dot');
      else dot.classList.remove('active-dot');
    });
  }
  function createReviewDots() {
    reviewSlides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.classList.add('review-dot');
      if (i === reviewIndex) dot.classList.add('active-dot');
      dot.addEventListener('click', () => {
        reviewIndex = i;
        updateReviewSlider();
        resetReviewAuto();
      });
      reviewDotsContainer.appendChild(dot);
    });
  }
  function nextReview() {
    reviewIndex = (reviewIndex + 1) % reviewSlides.length;
    updateReviewSlider();
  }
  function prevReview() {
    reviewIndex = (reviewIndex - 1 + reviewSlides.length) % reviewSlides.length;
    updateReviewSlider();
  }
  function startReviewAuto() { reviewAutoInterval = setInterval(nextReview, 4500); }
  function stopReviewAuto() { clearInterval(reviewAutoInterval); }
  function resetReviewAuto() { stopReviewAuto(); startReviewAuto(); }

  if (reviewSlides.length) {
    createReviewDots();
    updateReviewSlider();
    startReviewAuto();
    const sliderContainer = document.querySelector('.review-slider-container');
    sliderContainer.addEventListener('mouseenter', stopReviewAuto);
    sliderContainer.addEventListener('mouseleave', startReviewAuto);
    reviewPrev.addEventListener('click', () => { prevReview(); resetReviewAuto(); });
    reviewNext.addEventListener('click', () => { nextReview(); resetReviewAuto(); });
    window.addEventListener('resize', updateReviewSlider);
  }

  // ========== COPY ADDRESS ==========
  const copyBtn = document.querySelector('.copy-address');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const address = document.querySelector('.address-text')?.innerText || '';
      navigator.clipboard.writeText(address).then(() => {
        const original = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => { copyBtn.innerText = original; }, 2000);
      }).catch(() => alert('Could not copy address'));
    });
  }

  // ========== CALL & WHATSAPP ==========
  document.querySelector('.call-now')?.addEventListener('click', () => window.location.href = 'tel:+919876543210');
  document.querySelector('.whatsapp-btn')?.addEventListener('click', () => window.open('https://wa.me/919876543211?text=Hello%20Narayan%20Hotel', '_blank'));

  // ========== VIEW MORE BUTTON ==========
  document.querySelector('.view-more-btn')?.addEventListener('click', () => {
    alert('Explore more exclusive content from Narayan Hotel.');
  });

  // ========== 24x7 BUTTON ==========
  document.querySelector('.support-247-btn')?.addEventListener('click', () => {
    alert('Our team is available 24/7 to assist you.');
  });
});
