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
const details = gsap.utils.toArray(".desktopContentSection:not(:first-child)")
const photos = gsap.utils.toArray(".desktopPhoto:not(:first-child)")
gsap.set(photos, {yPercent:101})
const allPhotos = gsap.utils.toArray(".desktopPhoto")


// create
let mm = gsap.matchMedia();

// add a media query. When it matches, the associated function will run
mm.add("(min-width: 645px)", () => {

  // this setup code only runs when viewport is at least 600px wide	
	ScrollTrigger.create({
		trigger:".gallery",
		start:"top top",
		end:"bottom bottom",
		pin:".right"
})

//create scrolltrigger for each details section
//trigger photo animation when headline of each details section 
//reaches 80% of window height
details.forEach((detail, index)=> {
	let headline = detail.querySelector("h1")
	let animation = gsap.timeline()
	.to(photos[index], {yPercent:0})
	.set(allPhotos[index], {autoAlpha:0})
	ScrollTrigger.create({
		trigger:headline,
		start:"top 80%",
		end:"top 50%",
		animation:animation,
		scrub:true,
		markers:false
	})
})
});

// 3 - Texto coloreado
// Asegúrate de que GSAP y ScrollTrigger están correctamente importados
gsap.registerPlugin(ScrollTrigger);

// Selecciona todas las palabras en el contenedor de texto
const words = document.querySelectorAll(".word");

// Configura la animación de color para cada palabra y fija el contenedor hasta que el efecto se complete
gsap.to(words, {
    color: "#000", // Cambia el color de cada palabra a negro
    stagger: 0.1, // Retraso progresivo entre palabras para un efecto gradual
    scrollTrigger: {
        trigger: "#textSection",
        start: "top center", // Inicia cuando la parte superior de #textSection llega al top del viewport
        end: "+=200%", // Extiende el pin para que dure hasta que el efecto esté completo
        pin: true, // Fija el contenedor de texto durante el efecto de scroll
        scrub: 1, // Sincroniza la animación con el desplazamiento
        // markers: true // Activa los marcadores para verificar el efecto
    }
});

