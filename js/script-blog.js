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
mm.add("(min-width: 600px)", () => {

  // this setup code only runs when viewport is at least 600px wide
  console.log("desktop")
	
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



