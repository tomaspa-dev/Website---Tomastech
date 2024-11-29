import { stories } from "/src/js/data.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

let activeStory = 0;
const storyDuration = 4000;
let storyTimeout;
let direction = "next";
let isGalleryVisible = false;
const gallerySection = document.querySelector(".herogsap-section");
const titleRow1 = document.querySelector(".title-row h1");
const titleRow2 = document.querySelector(".title-second h2");
const mainText = document.querySelector(".main-text p");
const indices = document.querySelectorAll(".index-highlight");
const menuOverlay = document.querySelector(".menu-overlay");


function toggleGalleryPlayback(shouldPlay) {
    if (shouldPlay) {
        clearTimeout(storyTimeout);
        storyTimeout = setTimeout(changeStory, storyDuration);
    } else {
        clearTimeout(storyTimeout);
    }
}

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            isGalleryVisible = entry.isIntersecting;

            if (isGalleryVisible) {
                toggleGalleryPlayback(true);
                changeStory(); // Reinicia inmediatamente al volver a la vista
            } else {
                toggleGalleryPlayback(false);
            }
        });
    },
    { threshold: 0.5 }
);

observer.observe(gallerySection);

function changeStory() {
    const previousStory = activeStory;
    activeStory =
        direction === "next"
            ? (activeStory + 1) % stories.length
            : (activeStory - 1 + stories.length) % stories.length;

    const story = stories[activeStory];
    updateTextContent(story);
    updateImageContent(story);
    updateProgressBar(previousStory, activeStory);

    if (isGalleryVisible) {
        clearTimeout(storyTimeout);
        storyTimeout = setTimeout(changeStory, storyDuration);
    }
}

function updateTextContent(story) {
    const tl = gsap.timeline();
    tl.to([titleRow1, titleRow2, mainText], {
        opacity: 0,
        yPercent: -20,
        duration: 0.5,
        ease: "power2.in",
    })
        .call(() => {
            titleRow1.textContent = story.title[0];
            titleRow2.textContent = story.title[1];
            mainText.textContent = story.linkDescription;
        })
        .fromTo(
            [titleRow1, titleRow2, mainText],
            { opacity: 0, yPercent: 20 },
            { opacity: 1, yPercent: 0, duration: 0.5, ease: "power2.out" }
        );
}


function updateImageContent(story) {
    const currentImgContainer = document.querySelector(".story-img .imgstory");
    const newImgContainer = document.createElement("div");
    newImgContainer.classList.add("imgstory");
    const newStoryImg = document.createElement("img");
    newStoryImg.src = story.storyImg;
    newStoryImg.alt = "Story Image";
    newImgContainer.appendChild(newStoryImg);
    document.querySelector(".story-img").appendChild(newImgContainer);
    animateImageTransition(currentImgContainer, newImgContainer);
}

function animateImageTransition(oldImg, newImg) {
    // Aplica el efecto de barrido a la nueva imagen
    gsap.set(newImg, {
        clipPath: direction === "next" 
            ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" 
            : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
    });

    gsap.to(newImg, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "power4.inOut",
    });

    // Aplica el efecto de escalado a la imagen antigua
    if (oldImg) {
        gsap.to(oldImg, {
            scale: 1.5,
            opacity: 0,
            duration: 1,
            ease: "power4.inOut",
            onComplete: () => oldImg.remove(),
        });
    }

    // Aplica el escalado a la imagen nueva
    gsap.fromTo(newImg, {
        scale: 2,
        rotate: direction === "next" ? 25 : -25
    }, {
        scale: 1,
        rotate: 0,
        duration: 1,
        ease: "power4.inOut",
    });
}


function updateProgressBar(prevIndex, newIndex) {
    gsap.killTweensOf(indices[prevIndex]);
    gsap.killTweensOf(indices[newIndex]);

    gsap.set(indices[prevIndex], { width: "0%" });
    gsap.fromTo(
        indices[newIndex],
        { width: "0%" },
        { width: "100%", duration: storyDuration / 1000, ease: "none" }
    );
}

document.addEventListener("click", (event) => {
    if (gallerySection.contains(event.target)) {
        clearTimeout(storyTimeout);
        direction = event.clientX < window.innerWidth / 2 ? "prev" : "next";
        changeStory();
    }
});

menuOverlay.addEventListener("mouseenter", () => {
    toggleGalleryPlayback(false);
});

menuOverlay.addEventListener("mouseleave", () => {
    if (isGalleryVisible) {
        toggleGalleryPlayback(true);
    }
});


storyTimeout = setTimeout(changeStory, storyDuration);
