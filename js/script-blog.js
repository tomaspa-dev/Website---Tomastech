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
    color: "#262626", // Cambia el color de cada palabra a negro
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

//4 - slider gallery
//4 - slider gallery
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(CustomEase);
  CustomEase.create(
    "hop",
    "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1"
  );

  const sliderImages = document.querySelector(".slider-images");
  const counter = document.querySelector(".counter");
  const titles = document.querySelector(".slider-title-wrapper");
  const indicators = document.querySelectorAll(".slider-indicators p");
  const prevSlides = document.querySelectorAll(".slider-preview .preview");
  const slidePreview = document.querySelector(".slider-preview");

  let currentImg = 1;
  const totalSlides = 3;
  let indicatorRotation = 0;

  const updateCounterAndTitlePosition = () => {
    const counterY = -20 * (currentImg - 1);
    const titleY = -60 * (currentImg - 1);

    gsap.to(counter, {
      y: counterY,
      duration: 1,
      ease: "hop",
    });

    gsap.to(titles, {
      y: titleY,
      duration: 1,
      ease: "hop",
    });
  };

  const updateActiveSlidePreview = () => {
    prevSlides.forEach((prev) => prev.classList.remove("active"));
    prevSlides[currentImg - 1].classList.add("active");
  };

  const animateSlide = (direction) => {
    const currentSlide = document.querySelectorAll(".img")[document.querySelectorAll(".img").length - 1];

    const slideImg = document.createElement("div");
    slideImg.classList.add("img");

    const slideImgElem = document.createElement("img");
    slideImgElem.src = `./img/design${currentImg}.webp`;
    gsap.set(slideImgElem, { x: direction === "left" ? -300 : 300 });

    slideImg.appendChild(slideImgElem);
    sliderImages.appendChild(slideImg);

    gsap.to(currentSlide.querySelector("img"), {
      x: direction === "left" ? 300 : -300,
      duration: 1.5,
      ease: "power4.out",
    });

    gsap.fromTo(
      slideImg,
      {
        clipPath: direction === "left" ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
      },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "power4.out",
      }
    );

    gsap.to(slideImgElem, {
      x: 0,
      duration: 1.5,
      ease: "power4.out",
    });

    cleanupSlides();
    indicatorRotation += direction === "left" ? -90 : 90;

    gsap.to(indicators, {
      rotate: indicatorRotation,
      duration: 1,
      ease: "hop",
    });
  };

  document.addEventListener("click", (event) => {
    const sliderWidth = document.querySelector(".slider").clientWidth;
    const clickPosition = event.clientX;

    if (slidePreview.contains(event.target)) {
      const clickedPrev = event.target.closest(".preview"); // Corregido a 'closest'

      if (clickedPrev) {
        const clickedIndex = Array.from(prevSlides).indexOf(clickedPrev) + 1;

        if (clickedIndex !== currentImg) {
          if (clickedIndex < currentImg) {
            currentImg = clickedIndex;
            animateSlide("left");
          } else {
            currentImg = clickedIndex; // Corregido a 'currentImg'
            animateSlide("right");
          }
          updateActiveSlidePreview();
          updateCounterAndTitlePosition();
        }
      }
      return;
    }

    if (clickPosition < sliderWidth / 2 && currentImg !== 1) {
      currentImg--;
      animateSlide("left");
    } else if (clickPosition > sliderWidth / 2 && currentImg !== totalSlides) {
      currentImg++;
      animateSlide("right");
    }

    updateActiveSlidePreview();
    updateCounterAndTitlePosition();
  });

  const cleanupSlides = () => {
    const imgElements = document.querySelectorAll(".slider-images .img"); // Corregido a 'querySelectorAll'
    if (imgElements.length > totalSlides) {
      imgElements[0].remove();
    }
  };
});
