// 1 - GSAP SCroll
import { gsap } from "gsap";    
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
// Función para animar los elementos
function animateFromBottom(element, delay = 0) {
    gsap.to(element, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        delay: delay, // Aplica el retraso
        ease: "power2.out"
        });
    }
    // Observador para detectar cuando los elementos están al 50% del viewport
    const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const delay = [...element.parentElement.children].indexOf(element) * 0.3; // Añade delay por elemento
            animateFromBottom(element, delay); // Anima cada elemento con un retraso
            observer.unobserve(element); // Deja de observar después de la animación
        }
    });
  }, { threshold: 0.5 }); // 50% en el viewport
  // Aplica el observador a los elementos fuera de la hero-section
    document.querySelectorAll('.gsap').forEach(element => {
        observer.observe(element);
    });
    // Animar los elementos de la hero-section inmediatamente
    document.querySelectorAll('.herogsap-section .gsap').forEach((element, index) => {
    animateFromBottom(element, index * 0.3); // Anima con delay inmediato
});