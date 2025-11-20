/*!
 * gallery v0.3
 * javascript file for Sateula template
 * 
 * @license Copyright 2025, Sateula. All rights reserved.
 * Subject to the terms at sateula standard-license.
 * @author: xdarkshan, sateula
 */

document.addEventListener("DOMContentLoaded", () => {
    const noResultsMessage = document.getElementById("noResultsMessage");
    const gallery = document.querySelector(".gallery");
    const lightbox = document.querySelector(".lightbox");
    const lightboxBackground = document.getElementById('lightbox-background');
    const lightboxImg = lightbox.querySelector("img");
    const lightboxInfo = lightbox.querySelector(".lightbox-info");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");
    const zoomInBtn = lightbox.querySelector(".lightbox-zoom-in");
    const zoomOutBtn = lightbox.querySelector(".lightbox-zoom-out");
    const rotateBtn = lightbox.querySelector(".lightbox-rotate");
    const fullscreenBtn = lightbox.querySelector(".lightbox-fullscreen");
    const downloadBtn = lightbox.querySelector(".lightbox-download");
    const searchInput = document.getElementById("search");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const sortSelect = document.getElementById("sort");
    const backtupnya = document.getElementById("backtup");


    let currentImageIndex = 0;
    let images = [];
    let scale = 1;
    let rotation = 0;
    let isDragging = false;
    let startX,
        startY,
        translateX = 0,
        translateY = 0;
    let currentFilter = "all";
    let currentSort = "default";

    function initGallery() {
        const galleryItems = document.querySelectorAll(".gallery-item");
        images = Array.from(galleryItems).map((item) => ({
            src: item.querySelector("img").src,
            alt: item.querySelector("img").alt,
            title: item.querySelector("h3").textContent,
            category: item.dataset.category
        }));

        galleryItems.forEach((item, index) => {
            item.addEventListener("click", () => openLightbox(index));
        });

        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach((img) => imageObserver.observe(img));
    }

    function filterGallery() {
        const searchTerm = searchInput.value.toLowerCase();
        const galleryItems = document.querySelectorAll(".gallery-item");

        let resultsFound = 0;

        galleryItems.forEach((item) => {
            const title = item.querySelector("h3").textContent.toLowerCase();
            const category = item.dataset.category;
            const matchesSearch = title.includes(searchTerm);
            const matchesFilter =
                currentFilter === "all" || category === currentFilter;

            const showItem = matchesSearch && matchesFilter;
            item.style.display = showItem ? "block" : "none";

            if (showItem) {
                resultsFound++;
            }
        });

        if (resultsFound === 0) {
            noResultsMessage.style.display = "block";
        } else {
            noResultsMessage.style.display = "none";
        }

        sortGallery();
    }

    function sortGallery() {
        const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
        const gallery = document.querySelector(".gallery");

        galleryItems.sort((a, b) => {
            if (currentSort === "name") {
                return a
                    .querySelector("h3")
                    .textContent.localeCompare(b.querySelector("h3").textContent);
            } else if (currentSort === "category") {
                return a.dataset.category.localeCompare(b.dataset.category);
            }
            return 0;
        });

        galleryItems.forEach((item) => gallery.appendChild(item));
    }

    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add("active");
        backtupnya.style.display = "none";
        document.body.style.overflow = "hidden";
        resetZoom();
    }

    function rotateImage() {
        rotation = (rotation + 90) % 360;
        lightboxImg.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            lightbox.requestFullscreen();
            fullscreenBtn
                .querySelector("i")
                .classList.replace("fa-expand", "fa-compress");
        } else {
            document.exitFullscreen();
            fullscreenBtn
                .querySelector("i")
                .classList.replace("fa-compress", "fa-expand");
        }
    }

    function downloadImage() {
        const link = document.createElement("a");
        link.href = lightboxImg.src;
        link.download = `image-${currentImageIndex + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    searchInput.addEventListener("input", filterGallery);

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.category;
            filterGallery();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentSort = sortSelect.value;
            sortGallery();
        });
    }

    rotateBtn.addEventListener("click", rotateImage);
    fullscreenBtn.addEventListener("click", toggleFullscreen);
    downloadBtn.addEventListener("click", downloadImage);

    // Event listeners
    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", prevImage);
    nextBtn.addEventListener("click", nextImage);
    zoomInBtn.addEventListener("click", zoomIn);
    zoomOutBtn.addEventListener("click", zoomOut);

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;

        switch (e.key) {
            case "Escape":
                closeLightbox();
                break;
            case "ArrowLeft":
                prevImage();
                break;
            case "ArrowRight":
                nextImage();
                break;
            case "+":
                zoomIn();
                break;
            case "-":
                zoomOut();
                break;
        }
    });

    lightboxImg.addEventListener("mousedown", handleDragStart);
    lightboxImg.addEventListener("mousemove", handleDragMove);
    lightboxImg.addEventListener("mouseup", handleDragEnd);
    lightboxImg.addEventListener("mouseleave", handleDragEnd);
    lightboxImg.addEventListener("touchstart", handleDragStart);
    lightboxImg.addEventListener("touchmove", handleDragMove);
    lightboxImg.addEventListener("touchend", handleDragEnd);

    function zoomIn() {
        scale = Math.min(scale + 0.25, 3);
        updateZoom();
    }

    function zoomOut() {
        scale = Math.max(scale - 0.25, 1);
        updateZoom();
    }

    function updateZoom() {
        lightboxImg.style.transform = `scale(${scale})`;
    }

    function resetZoom() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        lightboxImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    }

    let animationFrameId = null;

    function handleDragStart(e) {
        if (scale > 1) {
            lightboxImg.classList.add('draggable');
        } else {
            lightboxImg.classList.remove('draggable', 'dragging-cursor');
            return;
        }

        if (e.type === "mousedown" || e.touches) {
            isDragging = true;

            lightboxImg.classList.add('dragging-cursor');
            lightboxImg.classList.remove('draggable');

            startX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
            startY = e.type === "mousedown" ? e.clientY : e.touches[0].clientY;

            e.preventDefault();
        }
    }

    function updateTransform() {
        lightboxImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        animationFrameId = null;
    }

    function handleDragMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const currentX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
        const currentY = e.type === "mousemove" ? e.clientY : e.touches[0].clientY;

        const dx = currentX - startX;
        const dy = currentY - startY;

        translateX += dx;
        translateY += dy;

        startX = currentX;
        startY = currentY;

        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(updateTransform);
        }
    }

    function handleDragEnd() {
        isDragging = false;

        lightboxImg.classList.remove('dragging-cursor');
        if (scale > 1) {
            lightboxImg.classList.add('draggable');
        } else {
            lightboxImg.classList.remove('draggable');
        }

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxImage();
    }

    function updateLightboxImage() {
        const image = images[currentImageIndex];
        const imageURL = image.src;
        lightboxImg.src = imageURL;
        lightboxBackground.style.backgroundImage = `url('${imageURL}')`;
        lightboxBackground.style.filter = "blur(10px) brightness(50%) grayscale(20%)"; 

        resetZoom();

        const infoSpan = lightboxInfo.querySelector(".image-caption");
        infoSpan.textContent = image.alt;
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        document.exitFullscreen();
        document.body.style.overflow = "";
        resetZoom();
    }

    initGallery();
});

document.addEventListener('DOMContentLoaded', function () {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const h3 = item.querySelector('.gallery-item-inner h3');
        const categorySpan = item.querySelector('.gallery-item-inner .category');

        if (img && h3 && categorySpan) {
            const imageTitle = img.getAttribute('alt');
            const categoryName = item.getAttribute('data-category');

            h3.textContent = imageTitle;
            categorySpan.textContent = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        }
    });
});

const scrollBtn = document.getElementById("backtup");

function scrollToTopSmoothly() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.onscroll = function () {
    const shouldBeVisible = document.body.scrollTop > 500 || document.documentElement.scrollTop > 500;
    const isGalleryVisible = document.body.classList.contains('is-article-visible');

    if (shouldBeVisible && isGalleryVisible) {
        scrollBtn.style.display = "block";
    } else {
        scrollBtn.style.display = "none";
    }
};

class AdvancedSlideshow {
    constructor() {
        this.slides = [
            {
                id: 1,
                image: "images/gallery/1.jpg",
            },
            {
                id: 2,
                image: "images/gallery/2.jpg",
            },
            {
                id: 3,
                image: "images/gallery/3.jpg",
            },
            {
                id: 4,
                image: "images/gallery/4.jpg",
            },
            {
                id: 5,
                image: "images/gallery/5.jpg",
            }
        ];

        this.currentSlide = 0;
        this.isPlaying = true;
        this.speed = 5000;
        this.showCaptions = true;
        this.slideInterval = null;
        this.progressInterval = null;
        this.isTransitioning = false;

        this.init();
    }

    async init() {
        try {
            this.createSlides();
            this.createThumbnails();
            this.createDots();
            this.setupEventListeners();
            this.showSlide(0);
            this.startAutoPlay();
            this.hideLoadingScreen();
        } catch (error) {
            console.error("Slideshow initialization failed:", error);
            this.hideLoadingScreen();
        }
    }

    createSlides() {
        const container = document.getElementById("slideshowContainer");
        const existingSlides = container.querySelectorAll(".slide");
        existingSlides.forEach((slide) => slide.remove());
        this.slides.forEach((slide, index) => {
            const slideElement = document.createElement("div");
            slideElement.className = "slide";
            slideElement.innerHTML = `
                        <div class="slide-image-container">
                            <img src="${slide.image}" alt="${slide.alt}" loading="lazy" style="-webkit-user-drag: none;">
                        </div>
                    `;

            const firstNavButton = container.querySelector(".nav-button");
            container.insertBefore(slideElement, firstNavButton);
        });
    }
    createThumbnails() {
        const container = document.getElementById("thumbnailsContainer");
        const fragment = document.createDocumentFragment();

        this.slides.forEach((slide, index) => {
            const thumbnail = document.createElement("div");
            thumbnail.className = "thumbnail";
            thumbnail.innerHTML = `<img src="${slide.image}" alt="${slide.alt}">`;
            thumbnail.addEventListener("click", () => this.goToSlide(index));
            fragment.appendChild(thumbnail);
        });

        const customThumbnail = document.createElement("div");
        customThumbnail.className = "thumbnail custom-link thumbnail-overlay";

        const customImg = document.createElement('img');
        customImg.src = "images/gallery/7.jpg";
        customImg.alt = "See Others";
        customImg.style.filter = "blur(5px)";

        const customText = document.createElement('span');
        customText.className = "thumbnail-text";
        customText.textContent = "View More";

        customThumbnail.appendChild(customImg);
        customThumbnail.appendChild(customText);

        customThumbnail.addEventListener("click", () => {
            window.location.href = "#mygallery";
        });
        fragment.appendChild(customThumbnail);

        container.innerHTML = "";
        container.appendChild(fragment);
    }

    createDots() {
        const container = document.getElementById("dotsContainer");
        container.innerHTML = "";

        this.slides.forEach((slide, index) => {
            const dot = document.createElement("span");
            dot.className = "dot";
            dot.addEventListener("click", () => this.goToSlide(index));
            container.appendChild(dot);
        });
    }

    setupEventListeners() {
        document.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case " ":
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
            }
        });

        const container = document.getElementById("slideshowContainer");
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener("mouseenter", () => {
            if (this.isPlaying) this.stopAutoPlay();
        });
        container.addEventListener("mouseleave", () => {
            if (this.isPlaying) this.startAutoPlay();
        });
    }

    showSlide(index) {
        if (this.isTransitioning) return;

        this.isTransitioning = true;
        this.currentSlide = index;

        const slides = document.querySelectorAll(".slide");
        const dots = document.querySelectorAll(".dot");
        const thumbnails = document.querySelectorAll(".thumbnail");

        slides.forEach((slide) => slide.classList.remove("active"));
        dots.forEach((dot) => dot.classList.remove("active"));
        thumbnails.forEach((thumb) => thumb.classList.remove("active"));

        if (slides[index]) slides[index].classList.add("active");
        if (dots[index]) dots[index].classList.add("active");
        if (thumbnails[index]) thumbnails[index].classList.add("active");

        this.updateSlideInfo();

        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex =
            (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }

    goToSlide(index) {
        if (index !== this.currentSlide) {
            this.showSlide(index);
        }
    }

    startAutoPlay() {
        if (this.slideInterval) this.stopAutoPlay();

        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, this.speed);

        this.startProgressBar();
    }

    stopAutoPlay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
        this.stopProgressBar();
    }

    updateSlideInfo() {
        const counter = document.getElementById("slideCounter");
        counter.textContent = `${this.currentSlide + 1} / ${this.slides.length}`;
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById("loadingScreen");
        loadingScreen.classList.add("hidden");
        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 500);
    }
}
let slideshow;
document.addEventListener("DOMContentLoaded", () => {
    slideshow = new AdvancedSlideshow();
});

