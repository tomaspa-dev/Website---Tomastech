//1 Anima el ancho de la barra de progreso
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


//2 Animar imagen al hacer scroll
gsap.from(".img-box-effect img", {
  opacity: 0,
  y: 50,
  duration: 1,
  scrollTrigger: {
    trigger: ".img-box-effect",
    start: "top 80%", // Inicia la animación cuando la imagen esté en el viewport
    toggleActions: "play none none reverse"
  }
});