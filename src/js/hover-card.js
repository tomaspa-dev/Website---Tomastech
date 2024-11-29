//Animar el hover con GSAP
import { gsap } from "gsap";    
document.querySelectorAll('.card-pricing, .blog-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            y: -10, 
            duration: 0.1,
            ease: "power2.out"
        });
    });
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            y: 0, 
            duration: 0.1,
            ease: "power2.in"
        });
    });
});