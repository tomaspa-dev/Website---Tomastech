gsap.registerPlugin(ScrollTrigger);
//1 - carousel Mover las cards con botones flechas izquierda y derecha
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            dots[i].classList.toggle('active', i === index);
        });
        currentIndex = index;
    }
    document.querySelector('.left-arrow').addEventListener('click', () => {
        const newIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(newIndex);
    });
    document.querySelector('.right-arrow').addEventListener('click', () => {
        const newIndex = (currentIndex + 1) % slides.length;
        showSlide(newIndex);
    });
    showSlide(currentIndex);
});

// 2 - Cambiar color del boton
// Seleccionar los botones
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
// Función para manejar el mousedown (cuando se presiona el botón)
function handleMouseDown(event) {
    event.target.classList.add('active');
}
// Función para manejar el mouseup (cuando se suelta el botón) o mouseleave (cuando el mouse sale del botón)
function handleMouseUpOrLeave(event) {
    // Espera 200 ms antes de quitar la clase activa para que el cambio sea visible
    setTimeout(() => {
        event.target.classList.remove('active');
    }, 200); //Ajustar el tiempo de retraso (en milisegundos)
}
// Añade los eventos mousedown, mouseup, y mouseleave a ambos botones
leftArrow.addEventListener('mousedown', handleMouseDown);
leftArrow.addEventListener('mouseup', handleMouseUpOrLeave);
leftArrow.addEventListener('mouseleave', handleMouseUpOrLeave);
rightArrow.addEventListener('mousedown', handleMouseDown);
rightArrow.addEventListener('mouseup', handleMouseUpOrLeave);
rightArrow.addEventListener('mouseleave', handleMouseUpOrLeave);

//3- Animación de flotación para el iPhone
gsap.to(".iphone-device", {
    duration: 4,
    y: "-20px",
    rotationX: 15,
    rotationY: -15,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
});
//Animación de flotación para los AirPods
gsap.to(".airpods-device", {
    duration: 5,
    y: "-15px", 
    x: "5px",
    rotationX: 10,
    rotationY: -10,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
});
//4 - Copiar datos de contacto
document.querySelectorAll('.copy-icon').forEach(icon => {
    icon.addEventListener('click', function (e) {
        e.preventDefault();
        //Obtener el texto que se va a copiar del atributo data-copy-text
        const textToCopy = this.getAttribute('data-copy-text');
        //API del Portapapeles para copiar
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                //Mostrar el mensaje de confirmación
                const confirmationBox = document.getElementById('copy-confirmation');
                confirmationBox.innerHTML = `${textToCopy} <br><span style="display: inline-block; margin-top: 8px;">copiado al portapapeles</span>`;
                confirmationBox.classList.add('show');
                //Ocultar el mensaje después de 4 segundos
                setTimeout(() => {
                    confirmationBox.classList.remove('show');
                }, 4000);
            })
            .catch(err => {
                console.error('Error al copiar al portapapeles: ', err);
            });
    });
});

// 5 - Efectos, Animaciones en boton confetti
document.querySelector(".btn-effect").addEventListener("mouseover", () => {
    if (document.querySelector(".btn-effect").classList.contains('confetti-triggered')) {
        return;
    }
    document.querySelector(".btn-effect").classList.add('confetti-triggered');
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0a4495', '#b1cffa', '#3c88f2', '#0e61d4', '#d8e7fc']
    });

    setTimeout(() => {
        document.querySelector(".btn-effect").classList.remove('confetti-triggered');
    }, 2000); //Frecuencia con la que se puede activar el confeti.
});

//6 - Faq abrir y ocultar preguntas
document.querySelectorAll('.faq-input').forEach((input) => {
    input.addEventListener('change', function () {
        if (this.checked) {
            document.querySelectorAll('.faq-input').forEach((otherInput) => {
                if (otherInput !== this && otherInput.checked) {
                    otherInput.checked = false;
                }
            });
        }
    });
});

// 7 - Galeria de imagenes
// Seleccionamos todos los videos de hover
const hoverVideos = document.querySelectorAll('.hover-video');
// Ajustamos la velocidad del video al hacer hover
hoverVideos.forEach(video => {
    video.addEventListener('mouseenter', () => {
        video.playbackRate = 2; // Velocidad más lenta
        video.play(); // Aseguramos que el video se reproduzca
    });

    video.addEventListener('mouseleave', () => {
        video.playbackRate = 1; // Volver a la velocidad normal
    });
});

// 8 - GSAP SCroll
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
    document.querySelectorAll('.hero-section .gsap').forEach((element, index) => {
    animateFromBottom(element, index * 0.3); // Anima con delay inmediato
});

//9 - Animar el hover con GSAP
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