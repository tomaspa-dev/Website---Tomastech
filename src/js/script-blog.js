
//1 Anima el ancho de la barra de progreso
import '/src/css/general.css';
import '/src/css/styles.css';
import '/src/css/blog1.css';
import '/src/css/blog.css';
import '/src/css/blog-img.css';
import '/src/css/gallery.css';
import { gsap } from "gsap";    
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
gsap.to("#progress-bar", {
  width: "100%", 
    scrollTrigger: {
        trigger: "article-read", //El elemento que está siendo "desplazado"
        start: "top top",   //Inicia cuando el top del artículo llega al top de la ventana
        end: "bottom bottom", //Termina cuando el bottom del artículo llega al bottom de la ventana
        scrub: true, //Hace que la animación esté ligada al scroll (suave)
    }
});

