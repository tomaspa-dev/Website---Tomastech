// 1 - GSAP SCroll
import { gsap } from "gsap";    
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
    scrollTrigger: ".iphone-device",
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
    scrollTrigger: ".airpods-device",
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