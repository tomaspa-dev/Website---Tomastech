//1 - slider gallery
import { gsap } from "gsap";  
document.addEventListener("DOMContentLoaded", () => {
    const gallerySection = document.querySelector(".gallery-section");
    const prefix = gallerySection.getAttribute("data-prefix") || "design";
    const sliderImages = document.querySelector(".slider-images");
    const counter = document.querySelector(".counter");
    const titles = document.querySelector(".slider-title-wrapper");
    const indicators = document.querySelectorAll(".slider-indicators p");
    const prevSlides = document.querySelectorAll(".slider-preview .preview");
    const slidePreview = document.querySelector(".slider-preview");

    let currentImg = 1;
    const totalSlides = prevSlides.length;
    let indicatorRotation = 0;

    const updateCounterAndTitlePosition = () => {
      const counterY = -20 * (currentImg - 1);
      const titleY = -60 * (currentImg - 1);

    gsap.to(counter, {
        y: counterY,
        duration: 1,
        ease: "hop",
    });

    gsap.to(titles, {
        y: titleY,
        duration: 1,
        ease: "hop",
    });
};

    const updateActiveSlidePreview = () => {
        prevSlides.forEach((prev) => prev.classList.remove("active"));
        prevSlides[currentImg - 1].classList.add("active");
    };

    const animateSlide = (direction) => {
        const currentSlide = document.querySelectorAll(".imgbox")[document.querySelectorAll(".imgbox").length - 1];

        const slideImg = document.createElement("div");
        slideImg.classList.add("imgbox");

        const slideImgElem = document.createElement("img");
        slideImgElem.src = `/img/${prefix}${currentImg}.webp`;
        slideImgElem.srcset = `/img/${prefix}${currentImg}.webp 1080w, /img/${prefix}${currentImg}-944.webp 944w, /img/${prefix}${currentImg}-644.webp 644w`;
        slideImgElem.sizes = "(max-width: 644px) 644w, (max-width: 944px) 944w, 1080w";

        slideImg.appendChild(slideImgElem);
        sliderImages.appendChild(slideImg);

        gsap.to(currentSlide.querySelector("img"), {
            x: direction === "left" ? 300 : -300,
            duration: 1.5,
            ease: "power4.out",
        });

    gsap.fromTo(
        slideImg,
        {
            clipPath: direction === "left" ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
        },
        {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.5,
            ease: "power4.out",
        }
    );

    gsap.to(slideImgElem, {
        x: 0,
        duration: 1.5,
        ease: "power4.out",
    });

    cleanupSlides();
    indicatorRotation += direction === "left" ? -90 : 90;

    gsap.to(indicators, {
        rotate: indicatorRotation,
        duration: 1,
        ease: "hop",
    });

    // Actualizar el contador y los títulos tras cambiar de slide
    updateCounterAndTitlePosition();
};

document.addEventListener("click", (event) => {
    const sliderWidth = document.querySelector(".slider").clientWidth;
    const clickPosition = event.clientX;

    if (slidePreview.contains(event.target)) {
        const clickedPrev = event.target.closest(".preview");

        if (clickedPrev) {
            const clickedIndex = Array.from(prevSlides).indexOf(clickedPrev) + 1;

            if (clickedIndex !== currentImg) {
                currentImg = clickedIndex;
                const direction = clickedIndex < currentImg ? "left" : "right";
                animateSlide(direction);
                updateActiveSlidePreview();
                updateCounterAndTitlePosition();
            }
        }
        return;
    }

    if (clickPosition < sliderWidth / 2 && currentImg > 1) {
        currentImg--;
        animateSlide("left");
    } else if (clickPosition > sliderWidth / 2 && currentImg < totalSlides) {
        currentImg++;
        animateSlide("right");
    }

    updateActiveSlidePreview();
    updateCounterAndTitlePosition();
});

    const cleanupSlides = () => {
        const imgElements = document.querySelectorAll(".slider-images .imgbox");
        if (imgElements.length > totalSlides) {
            imgElements[0].remove();
        }
    };
});
