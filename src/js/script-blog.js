
//1 Anima el ancho de la barra de progreso
import { gsap } from "gsap";    
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
gsap.to("#progress-bar", {
  width: "100%", // Alcanza el 100% cuando se completa el scroll
    scrollTrigger: {
        trigger: "article-read", // El elemento que está siendo "desplazado"
        start: "top top",   // Inicia cuando el top del artículo llega al top de la ventana
        end: "bottom bottom", // Termina cuando el bottom del artículo llega al bottom de la ventana
        scrub: true, // Hace que la animación esté ligada al scroll (suave)
    }
});

