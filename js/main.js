document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Toggle hamburger animation
            const spans = mobileMenuBtn.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Hero Slider Logic
    const heroSlider = document.querySelector('.hero-slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideCount = slides.length;

    // 修复首页加载时第一张图漂浮动画不触发的问题：
    // 通过瞬间归零 transform 并强制重绘，触发 CSS 的 transition，避免使用 animation 导致的回挫
    if (slides.length > 0) {
        const firstBg = slides[0].querySelector('.slide-bg');
        if (firstBg) {
            firstBg.style.transition = 'none';
            firstBg.style.transform = 'translate(0, 0)';
            void firstBg.offsetWidth; // 强制重绘
            firstBg.style.transition = '';
            firstBg.style.transform = '';
        }
    }
    
    function goToSlide(n, isAutoSlide = false) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = (n + slideCount) % slideCount;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');

        // Reset timer if this was a manual interaction (not triggered by setTimeout)
        if (!isAutoSlide && !isPaused) {
            clearTimeout(slideInterval);
            remainingTime = 6000;
            startSlideTimer(remainingTime);
        }
    }
    
    function nextSlide(isAutoSlide = false) {
        goToSlide(currentSlide + 1, isAutoSlide);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1, false);
    }
    
    // Add visual feedback class for mobile touch devices
    function triggerButtonFeedback(btn) {
        btn.classList.add('is-clicked');
        setTimeout(() => {
            btn.classList.remove('is-clicked');
        }, 400); // 增加到 400ms，让变色停留更久，提供明显的反馈
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            triggerButtonFeedback(prevBtn);
            prevSlide();
        });
        nextBtn.addEventListener('click', () => {
            triggerButtonFeedback(nextBtn);
            nextSlide(false);
        });
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index, false));
    });
    
    // Auto slide with pause/resume maintaining remaining time
    let slideInterval;
    let startTime;
    let remainingTime = 6000;
    let isPaused = false;

    function startSlideTimer(time) {
        clearTimeout(slideInterval);
        startTime = Date.now();
        slideInterval = setTimeout(() => {
            // Trigger next slide as an auto slide
            nextSlide(true);
            
            // Wait for transition to complete before resetting time
            remainingTime = 6000;
            startSlideTimer(remainingTime);
        }, time);
    }

    // Initial start
    if (slides.length > 0) {
        startSlideTimer(remainingTime);
    }

    // Pause slider on hover over primary buttons
    const primaryBtns = document.querySelectorAll('.hero-slider .btn-primary');
    primaryBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            isPaused = true;
            clearTimeout(slideInterval);
            if (heroSlider) heroSlider.classList.add('is-paused');
            // Calculate how much time is left before the next slide was supposed to happen
            remainingTime -= (Date.now() - startTime);
            if (remainingTime < 0) remainingTime = 0;
        });
        btn.addEventListener('mouseleave', () => {
            isPaused = false;
            if (heroSlider) heroSlider.classList.remove('is-paused');
            // Resume with the exact remaining time
            startSlideTimer(remainingTime);
        });
    });
    // Search toggle logic
    const searchForms = document.querySelectorAll('.nav-search form');
    searchForms.forEach(form => {
        const input = form.querySelector('.search-input');
        const btn = form.querySelector('.search-btn');
        
        if (btn && input) {
            btn.addEventListener('click', (e) => {
                if (input.value.trim() === '') {
                    e.preventDefault();
                    form.classList.toggle('is-open');
                    if (form.classList.contains('is-open')) {
                        input.focus();
                    }
                }
            });
            
            // Close search when clicking outside
            document.addEventListener('click', (e) => {
                if (!form.contains(e.target) && input.value.trim() === '') {
                    form.classList.remove('is-open');
                }
            });
        }
    });
});
