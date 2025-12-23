/*!
 * gallery.js v25.12.22 - Fully Dynamic Generation Mode & Cleaned Up (Major Update)
 * javascript file for Sateula template
 * @license Copyright 2025, Sateula. All rights reserved.
 * Subject to the terms at sateula standard-license.
 * @author: xdarkshan, sateula
 * GPL LICENSE
 * THE CONTENT, ALL IMAGES IS ONLY FOR PERSONAL USE. NO PART OF THIS PUBLICATION
 * MAY BE REPRODUCED, DISTRIBUTED, OR TRANSMITTED IN ANY FORM
 * OR BY ANY MEANS, INCLUDING PHOTOCOPYING, RECORDING, OR OTHER
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
    const searchInput = document.getElementById("search");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const sortSelect = document.getElementById("sort");
    const backtupnya = document.getElementById("backtup");
    const glassbar = document.querySelector(".glass-bar");

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
    let animationFrameId = null; 

    function createGalleryItem(data, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-category', data.category);
        item.innerHTML = `
            <div class="gallery-item-inner">
                <img src="${data.src}" alt="${data.alt}" loading="lazy">
                <h3>${data.alt}</h3>
                <span class="category">${data.category.charAt(0).toUpperCase() + data.category.slice(1)}</span>
            </div>
        `;

        item.addEventListener("click", () => openLightbox(index));
        return item;
    }

    async function initGallery() {
        try {
            glassbar.style.display = "grid";
            const response = await fetch('assets/txt/gallery.txt');

            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status}`);
            }

            const dataText = await response.text();
            images = JSON.parse(dataText);

            gallery.innerHTML = '';

            const fragment = document.createDocumentFragment();
            images.forEach((data, index) => {
                fragment.appendChild(createGalleryItem(data, index));
            });
            gallery.appendChild(fragment);

            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        observer.unobserve(img);
                    }
                });
            });
            lazyImages.forEach((img) => imageObserver.observe(img));

            filterGallery();
        } catch (error) {
            console.error('An error occurred while loading or parsing gallery data:', error);
            gallery.innerHTML = '<p>Error: Failed to load gallery. Make sure the gallery.txt file exists and is formatted correctly.</p>';
        }
    }

    // LIGHTBOX TOOLS
    function rotateImage() {
        rotation = (rotation + 90) % 360;
        updateTransform();
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

    function zoomIn() {
        scale = Math.min(scale + 0.25, 3);
        updateTransform();
    }

    function zoomOut() {
        scale = Math.max(scale - 0.25, 1);
        if (scale === 1) { // Reset
            translateX = 0;
            translateY = 0;
        }
        updateTransform();
    }

    function updateTransform() {
        lightboxImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`;
        animationFrameId = null;
    }

    function resetZoom() {
        scale = 1;
        rotation = 0;
        translateX = 0;
        translateY = 0;
        updateTransform(); 
    }

    // DRAG/PAN FUNCTION
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

    // NAVIGATION GALERY & LIGHTBOX
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
        const visibleItems = Array.from(document.querySelectorAll('.gallery-item'))
            .filter(item => item.style.display !== 'none');

        images = visibleItems.map(item => ({
            src: item.querySelector("img").src,
            alt: item.querySelector("img").alt,
            category: item.dataset.category
        }));
        const clickedElement = visibleItems[index];

        currentImageIndex = images.findIndex(img => img.src === clickedElement.querySelector("img").src);
        if (currentImageIndex === -1) { currentImageIndex = 0; } // Fallback

        updateLightboxImage();
        lightbox.classList.add("active");
        backtupnya.style.display = "none";
        glassbar.style.display = "none";
        document.body.style.overflow = "hidden";
        resetZoom();
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
        glassbar.style.display = "grid";
        lightbox.classList.remove("active");
        document.exitFullscreen();
        document.body.style.overflow = "";
        resetZoom();
    }

    // --- EVENT LISTENERS ---
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

    // Lightbox Controls
    rotateBtn.addEventListener("click", rotateImage);
    fullscreenBtn.addEventListener("click", toggleFullscreen);
    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", prevImage);
    nextBtn.addEventListener("click", nextImage);
    zoomInBtn.addEventListener("click", zoomIn);
    zoomOutBtn.addEventListener("click", zoomOut);

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;
        switch (e.key) {
            case "Escape": closeLightbox(); break;
            case "ArrowLeft": prevImage(); break;
            case "ArrowRight": nextImage(); break;
            case "+": zoomIn(); break;
            case "-": zoomOut(); break;
        }
    });

    // Drag/Pan events
    lightboxImg.addEventListener("mousedown", handleDragStart);
    lightboxImg.addEventListener("mousemove", handleDragMove);
    lightboxImg.addEventListener("mouseup", handleDragEnd);
    lightboxImg.addEventListener("mouseleave", handleDragEnd);
    lightboxImg.addEventListener("touchstart", handleDragStart);
    lightboxImg.addEventListener("touchmove", handleDragMove);
    lightboxImg.addEventListener("touchend", handleDragEnd);

    initGallery();
});