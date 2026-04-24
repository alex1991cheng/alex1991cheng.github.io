document.addEventListener('DOMContentLoaded', () => {
    // Header shrink on scroll
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Add a hysteresis/deadzone to prevent jittering
                // Trigger shrink when scrolling down past 80px
                if (lastScrollY > 80 && !header.classList.contains('shrink')) {
                    header.classList.add('shrink');
                } 
                // Only trigger unshrink when scrolling back up past 20px
                else if (lastScrollY < 20 && header.classList.contains('shrink')) {
                    header.classList.remove('shrink');
                }
                ticking = false;
            });
            ticking = true;
        }
    });

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

    // Contact Form mailto handling
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent the default form submission which might be blocked by browsers

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subjectElement = document.getElementById('subject');
            const subjectText = subjectElement.options[subjectElement.selectedIndex].text;
            const message = document.getElementById('message').value;

            // Construct the email body
            let body = `Name: ${name}%0D%0A`;
            body += `Email: ${email}%0D%0A`;
            body += `Subject: ${subjectText}%0D%0A`;
            body += `-------------------------%0D%0A%0D%0A`;
            body += `${message}`;

            // Create the mailto link
            const mailtoLink = `mailto:support@val-tecs.com?subject=Valtecs Website Contact: ${encodeURIComponent(subjectText)}&body=${body}`;

            // Open the mailto link
            window.location.href = mailtoLink;
        });
    }

        // Support Page Resource Center Logic
    const resourceTabs = document.querySelectorAll('.tab-btn');
    const resourceGrids = document.querySelectorAll('.resource-grid');
    const resourceSearchInput = document.getElementById('resource-search-input');
    const noResourceResults = document.getElementById('no-resource-results');
    const searchHintElement = document.getElementById('resource-search-hint'); // 新增的底部提示语

    if (resourceTabs.length > 0 && resourceSearchInput) {
        
        // On load, assign an original index to each card to maintain order later
        resourceGrids.forEach(grid => {
            const cards = grid.querySelectorAll('.resource-card:not(.resource-list-header)');
            cards.forEach((card, index) => {
                card.setAttribute('data-original-index', index);
            });
        });

        // Tab Switching
        resourceTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab button
                resourceTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active grid
                const targetId = tab.getAttribute('data-target');
                resourceGrids.forEach(grid => {
                    if (grid.id === targetId) {
                        grid.classList.add('active');
                    } else {
                        grid.classList.remove('active');
                    }
                });

                // Re-trigger search to update visibility in the newly active tab
                triggerResourceSearch();
            });
        });

        // Search Filtering
        function triggerResourceSearch() {
            const query = resourceSearchInput.value.toLowerCase().trim();
            let hasVisibleCards = false;
            
            // Check if we are currently searching
            const isSearching = query.length > 0;
            
            if (!isSearching) {
                // If search is empty, revert to tab logic
                document.querySelector('.resource-tabs').style.display = 'flex';
                
                // 显示底部提示暗示用户搜索
                if (searchHintElement) searchHintElement.style.display = 'flex';
                
                // Hide the global search header if it exists
                const globalHeader = document.getElementById('global-search-header');
                if (globalHeader) globalHeader.style.display = 'none';
                
                resourceGrids.forEach(grid => {
                    // Show the specific grid's header
                    const gridHeader = grid.querySelector('.resource-list-header');
                    if (gridHeader) gridHeader.style.display = 'grid';
                    
                    // Only show cards in the active grid, hide others
                    if (grid.classList.contains('active')) {
                        grid.style.display = ''; // Let CSS handle it (display: block via active class logic)
                        const cards = Array.from(grid.querySelectorAll('.resource-card:not(.resource-list-header)'));
                        
                        // 还原原始排序
                        cards.sort((a, b) => parseInt(a.getAttribute('data-original-index')) - parseInt(b.getAttribute('data-original-index')));
                        
                        cards.forEach((card, index) => {
                            grid.appendChild(card); // 重新挂载回 DOM 保证顺序
                            if (index < 6) { // 限制只显示6个
                                card.style.display = ''; // Revert to grid layout defined in CSS
                                // For videos, make sure the "Watch Video" button is visible
                                const videoBtn = card.querySelector('a[href*=".mp4"]');
                                if (videoBtn) videoBtn.style.display = '';
                                hasVisibleCards = true;
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    } else {
                        grid.style.display = ''; // Let CSS handle it (display: none via active class logic)
                        const cards = grid.querySelectorAll('.resource-card:not(.resource-list-header)');
                        cards.forEach(card => card.style.display = 'none');
                    }
                });
            } else {
                // If searching, hide tabs and search across ALL grids
                document.querySelector('.resource-tabs').style.display = 'none';
                
                // 隐藏底部的常规提示，如果没搜到东西会显示 "No results"
                if (searchHintElement) searchHintElement.style.display = 'none';
                
                // Show global search header, hide individual grid headers
                let globalHeader = document.getElementById('global-search-header');
                
                // Create global header if it doesn't exist
                if (!globalHeader) {
                    const firstGrid = document.querySelector('.resource-grid');
                    globalHeader = document.createElement('div');
                    globalHeader.id = 'global-search-header';
                    globalHeader.className = 'resource-list-header';
                    globalHeader.innerHTML = `
                        <div>Model / Name</div>
                        <div>SKU</div>
                        <div>Type</div>
                        <div>Document</div>
                    `;
                    firstGrid.parentNode.insertBefore(globalHeader, firstGrid);
                }
                globalHeader.style.display = 'grid';
                
                let allMatchedCards = []; // 跨网格收集所有匹配的卡片

                resourceGrids.forEach(grid => {
                    // Hide individual grid headers during search
                    const gridHeader = grid.querySelector('.resource-list-header');
                    if (gridHeader) gridHeader.style.display = 'none';
                    
                    const cards = Array.from(grid.querySelectorAll('.resource-card:not(.resource-list-header)'));
                    
                    cards.forEach(card => {
                        const titleData = card.getAttribute('data-title') || '';
                        const rawText = card.innerText.toLowerCase(); // 获取所有文本用于全量匹配
                        let score = 0;

                        if (titleData === query) {
                            score += 100; // 精准匹配
                        } else if (titleData.includes(query)) {
                            score += 50; // 标题包含
                            if (titleData.startsWith(query)) score += 20; // 标题以关键字开头，权重更高
                        } else if (rawText.includes(query)) {
                            score += 10; // 内容(如SKU、Type等)包含
                        }

                        if (score > 0) {
                            allMatchedCards.push({ card: card, score: score, grid: grid });
                        }
                        card.style.display = 'none'; // 先全部隐藏
                    });
                    
                    // Force the grid container to be visible if it has matches or we are searching
                    // (we need all grids visible to show all matched cards together)
                    grid.style.display = 'block';
                });

                // 根据关联性分数对所有匹配项进行降序排序
                allMatchedCards.sort((a, b) => b.score - a.score);

                // 重新渲染匹配的卡片
                allMatchedCards.forEach(item => {
                    item.card.style.display = ''; // 恢复显示
                    const videoBtn = item.card.querySelector('a[href*=".mp4"]');
                    if (videoBtn) videoBtn.style.display = '';
                    
                    // 将其重新附加到所在的网格末尾，以实现视觉上的排序
                    item.grid.appendChild(item.card);
                    hasVisibleCards = true;
                });
            }

            // Show or hide "No results" message
            if (hasVisibleCards) {
                noResourceResults.style.display = 'none';
            } else {
                noResourceResults.style.display = 'block';
            }
        }

        // Initialize display state on load (limits to 6)
        triggerResourceSearch();
        
        resourceSearchInput.addEventListener('input', triggerResourceSearch);
    }

    // Scroll Reveal Animation for About Us Heritage section
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (revealElements.length > 0) {
        const revealOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px', // Trigger slightly before the element comes into full view
            threshold: 0.15
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Stop observing once it has become visible (triggers only once)
                }
            });
        }, revealOptions);

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }
});
