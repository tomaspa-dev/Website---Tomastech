//1 - Efectos de incremento en numeros en la sección hero
function incrementNumber(element, start, end, increment, duration) {
    let current = start;
    const range = end - start;
    const stepTime = Math.abs(Math.floor(duration / (range / increment)));
    const obj = document.getElementById(element);
    
    const timer = setInterval(() => {
        current += increment;
        obj.textContent = current.toLocaleString(); // Formato con separador de miles
        if (current >= end) {
        clearInterval(timer);
        obj.textContent = end.toLocaleString(); // Asegura que termine exactamente en el número final
        }
    }, stepTime);
    }
    
    // Llamada a la función con diferentes incrementos
    incrementNumber("number1", 0, 2, 1, 1000);  // Incremento de 1 en 1 hasta 2
    incrementNumber("number2", 0, 20, 2, 1000); // Incremento de 2 5en 2 hasta 200
    incrementNumber("number3", 0, 10, 1, 1500); // Incremento de 1 en 1 hasta 40
    

//2 - carousel Mover las cards con botones flechas izquierda y derecha
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


// 3 - Cambiar color del boton
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


//4- Animación de flotación para el iPhone
gsap.to(".iphone-device", {
    duration: 4,
    y: "-20px",
    rotationX: 15,
    rotationY: -15,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
});

// Animación de flotación para los AirPods
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