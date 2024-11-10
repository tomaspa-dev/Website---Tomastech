import { stories } from "/js/data.js";

let activeStory = 0;
const storyDuration = 4000;
const contentUpdateDelay = 0.4;
let direction = "next";
let storyTimeout;
const header = document.querySelector('.header'); // Selecciona el header
const heroSection = document.querySelector('.herogsap-section');
const cursor = document.querySelector(".cursor");
const cursorText = cursor?.querySelector("p");
const titleRow1 = document.querySelector(".title-row h1");
const titleRow2 = document.querySelector(".title-second h2");
const mainText = document.querySelector(".main-text p");
gsap.registerPlugin(ScrollTrigger);

if (cursor && cursorText) {
    // Actualiza la posición y el contenido del cursor en función de la posición del mouse
    document.addEventListener("mousemove", (event) => {
        const { clientX, clientY } = event;
        // Mueve el cursor personalizado al lugar del puntero
        gsap.to(cursor, {
            x: clientX + 15,
            y: clientY + 15,
            ease: "power2.out",
            duration: 0.1,
        });
        // Cambia el texto del cursor a "Prev" o "Next" según la posición horizontal
        const viewportWidth = window.innerWidth;
        if (clientX < viewportWidth / 2) {
            cursorText.textContent = "Prev";
            direction = "prev";
        } else {
            cursorText.textContent = "Next";
            direction = "next";
        }
    });
    // Muestra el cursor cuando entra en `heroSection` y ocúltalo en `header`
    heroSection.addEventListener('mouseenter', () => {
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
    });
    heroSection.addEventListener('mouseleave', () => {
        gsap.to(cursor, { opacity: 0, duration: 0.3 });
    });
    header.addEventListener('mouseenter', () => {
        gsap.to(cursor, { opacity: 0, duration: 0.3 });
    });
    header.addEventListener('mouseleave', () => {
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
    });
    // Cambia de historia al hacer clic
    document.addEventListener("click", () => {
        if (heroSection.contains(event.target)) {
            clearTimeout(storyTimeout);
            resetIndexHighlight(activeStory);
            changeStory();
        }
    });
}
// Nueva función para el efecto de entrada y salida en los textos
function animateTextEffect(element, isEntering) {
    const tl = gsap.timeline();
    tl.to(element, {
        yPercent: isEntering ? -100 : 100,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in"
    }).fromTo(
        element, 
        { yPercent: isEntering ? 100 : -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
}
// Función para cambiar la historia, conservando todas las animaciones originales
function changeStory() {
    const previousStory = activeStory;
    activeStory = direction === "next" ? (activeStory + 1) % stories.length : (activeStory - 1 + stories.length) % stories.length;
    const story = stories[activeStory];
    // Aplica el nuevo efecto de entrada y salida en los textos
    animateTextEffect(titleRow1, true);
    animateTextEffect(titleRow2, true);
    animateTextEffect(mainText, true);
    // Actualizar textos después de la animación de salida
    setTimeout(() => {
        titleRow1.textContent = story.title[0];
        titleRow2.textContent = story.title[1];
        mainText.textContent = story.linkDescription;
    }, 500);
    // Actualización de enlace
    const link = document.querySelector(".link a");
    link.textContent = story.linkLabel;
    link.href = story.linkSrc;
    // Efecto de escalado y barrido en la imagen
    const currentImgContainer = document.querySelector(".story-img .imgstory");
    const currentImg = currentImgContainer?.querySelector("img");

    const newImgContainer = document.createElement("div");
    newImgContainer.classList.add("imgstory");
    const newStoryImg = document.createElement("img");
    newStoryImg.src = story.storyImg;
    newImgContainer.appendChild(newStoryImg);
    document.querySelector(".story-img").appendChild(newImgContainer);
    animateNewImage(newImgContainer);
    animateImageScale(currentImg, newStoryImg);
    // Mantener el efecto de highlight en la línea de progreso
    resetIndexHighlight(previousStory);
    animateIndexHighlight(activeStory);
    cleanUpElements();
    clearTimeout(storyTimeout);
    storyTimeout = setTimeout(changeStory, storyDuration);
}

function animateNewImage(imgContainer) {
    gsap.set(imgContainer, {
        clipPath: direction === "next" ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
    });
    gsap.to(imgContainer, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "power4.inOut"
    });
}

function animateImageScale(currentImage, upcomingImg) {
    gsap.fromTo(currentImage, {
        scale: 1, rotate: 0
    }, {
        scale: 2,
        rotate: direction === "next" ? -25 : 25,
        duration: 1,
        ease: "power4.inOut",
        onComplete: () => {
            currentImage?.parentElement?.remove();
        },
    });
    gsap.fromTo(upcomingImg, {
        scale: 2, rotate: direction === "next" ? 25 : -25
    }, {
        scale: 1, rotate: 0, duration: 1, ease: "power4.inOut",
    });
}

function resetIndexHighlight(index) {
    const highlight = document.querySelectorAll(".index .index-highlight")[index];
    if (highlight) {
        gsap.killTweensOf(highlight);
        gsap.to(highlight, {
            width: "0%",
            duration: 0.3,
            onStart: () => {
                gsap.to(highlight, {
                    transformOrigin: "right center",
                    scaleX: 0,
                    duration: 0.3,
                });
            },
        });
    }
}

function animateIndexHighlight(index) {
    const highlight = document.querySelectorAll(".index .index-highlight")[index];
    if (highlight) {
        gsap.set(highlight, { width: "0%", scaleX: 1, transformOrigin: "right center" });
        gsap.to(highlight, { width: "100%", duration: storyDuration / 1000, ease: "none" });
    }
}

function cleanUpElements() {
    const titleRows = document.querySelectorAll(".title-row");
    titleRows.forEach((titleRow) => {
        while (titleRow.childElementCount > 1) {
            titleRow.removeChild(titleRow.firstChild);
        }
    });
}
// Iniciar cambio de historia automáticamente
storyTimeout = setTimeout(changeStory, storyDuration);
animateIndexHighlight(activeStory);
