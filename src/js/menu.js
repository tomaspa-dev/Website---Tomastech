// 1 - GSAP SCroll
import { gsap } from "gsap";
document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("toggle-btn");
    const menuOverlay = document.querySelector(".menu-overlay");
    const hamburger = document.getElementById("hamburger");
    const menuItems = document.querySelectorAll(".menu-item a");
    const closeBtn = document.createElement("div");
    closeBtn.classList.add("close-btn");
    closeBtn.innerHTML = "×";
    // Función para abrir el menú
    function openMenu() {
        menuOverlay.style.visibility = "visible";
        gsap.to(menuOverlay, { opacity: 1, duration: 0.5 });
        gsap.fromTo(
            menuItems,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.2, clearProps: "all", onComplete: () => {
                // Limpiar transformaciones en línea
                menuItems.forEach(item => {
                    item.style.transform = ""; // Limpiar transform
                    item.style.rotate = "";     // Limpiar rotate
                    item.style.scale = "";      // Limpiar scale
                });
            }}
        );
        menuOverlay.appendChild(closeBtn);
    }
    // Función para cerrar el menú
    function closeMenu() {
        gsap.to(menuOverlay, { opacity: 0, duration: 0.5, onComplete: () => {
            menuOverlay.style.visibility = "hidden";
            closeBtn.remove();
        }});
    }
    // Alternar entre abrir y cerrar menú
    if (toggleBtn && hamburger) {
        toggleBtn.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            if (hamburger.classList.contains("active")) {
                openMenu();
            } else {
                closeMenu();
            }
        });
    } else {
        console.error("El botón de menú o el contenedor de hamburguesa no se encontró en el DOM.");
    }
    // Cerrar el menú al hacer clic en un enlace
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            // e.preventDefault(); 
            gsap.to(item, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
            setTimeout(closeMenu, 300); // Cierra después del efecto
            hamburger.classList.remove("active"); // Resetea el botón de hamburguesa
        });
    });
    // Cerrar el menú al hacer clic en el botón de cerrar (X)
    closeBtn.addEventListener("click", closeMenu);
    // Cerrar el menú si se hace clic fuera de la caja de menú
    menuOverlay.addEventListener("click", (e) => {
        if (!e.target.closest('.menu-container')) {
            closeMenu();
            hamburger.classList.remove("active");
        }
    });
});
//Video
document.addEventListener("DOMContentLoaded", function() {
    const menuItems = document.querySelectorAll(".menu-item");
    const work = document.querySelector(".work");
    const overlay = document.querySelector(".overlay");
    const prevElements = document.querySelectorAll(".prev");

    overlay.style.top = "0%";
    overlay.style.left = "13.25%";

    document.querySelector("#prev-2").classList.add("active");

    function removeActiveClass() {
        prevElements.forEach(function (prev) {
            prev.classList.remove("active");
        });
    }

    menuItems.forEach((item, index) => {
        item.addEventListener("mouseover", function(){
            removeActiveClass();
            const activePrev = document.querySelector("#prev-" + (index+1));
            if(activePrev) {
                activePrev.classList.add("active");
            }
            work.classList.add("hovered");
            switch(index) {
                case 0:
                    overlay.style.top = "50%";
                    overlay.style.left = "50%";
                    work.className = "work bg-color-home hovered";
                    break;
                case 1:
                    overlay.style.top = "10%";
                    overlay.style.left = "-13.25%";
                    work.className = "work bg-color-services hovered";
                    break;
                case 2:
                    overlay.style.top = "-20%";
                    overlay.style.left = "23.5%";
                    work.className = "work bg-color-work hovered";
                    break;
                case 3:
                    overlay.style.top = "25%";
                    overlay.style.left = "33.5%";
                    work.className = "work bg-color-blog hovered";
                    break;
                case 4:
                    overlay.style.top = "-5%";
                    overlay.style.left = "-5%";
                    work.className = "work bg-color-about hovered";
                    break;
                case 5:
                    overlay.style.top = "5%";
                    overlay.style.left = "15%";
                    work.className = "work bg-color-cta hovered";
                    break;
                default:
                    overlay.style.top = "50%";
                    overlay.style.left = "50%";
                    work.className = "work bg-color-default hovered";
            }
        });

        item.addEventListener("mouseout", function() {
            work.classList.remove("hovered");
            work.clasName = "work";
            overlay.style.top = "0%";
            overlay.style.left = "13.25%";
            removeActiveClass();
            document.querySelector("#prev-2").classList.add("active");
        });
    });
});