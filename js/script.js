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


//5 - Copiar datos de contacto
document.querySelectorAll('.copy-icon').forEach(icon => {
    icon.addEventListener('click', function (e) {
        e.preventDefault();

        // Obtener el texto que se va a copiar del atributo data-copy-text
        const textToCopy = this.getAttribute('data-copy-text');

        // Usar la API del Portapapeles para copiar
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Mostrar el mensaje de confirmación
                const confirmationBox = document.getElementById('copy-confirmation');
                confirmationBox.innerHTML = `${textToCopy} <br><span style="display: inline-block; margin-top: 8px;">copiado al portapapeles</span>`;
                confirmationBox.classList.add('show');

                // Ocultar el mensaje después de 2 segundos
                setTimeout(() => {
                    confirmationBox.classList.remove('show');
                }, 4000);
            })
            .catch(err => {
                console.error('Error al copiar al portapapeles: ', err);
            });
    });
});


// 6 - Efectos, Animaciones en  boton confetti
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
    }, 2000); // Ajuste la frecuencia con la que se puede activar el confeti.
});


// 7 - Carousel video
let currentVideoIndex = 0;
const videos = document.querySelectorAll('.video-card video');
const progressBar = document.querySelector('.progress-bar');
const playPauseBtn = document.getElementById('playPauseBtn');
const dots = document.querySelectorAll('.dot-video');
let isPlaying = true;
let interval;

// Función para reproducir el video
function playVideo(video) {
    video.play();
    updateProgress(video);
}

// Función para actualizar la barra de progreso
function updateProgress(video) {
    interval = setInterval(() => {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${progress}%`;

        if (video.ended) {
            clearInterval(interval);
            nextVideo(); // Cambiar al siguiente video cuando termine el actual
        }
    }, 500);
}

// Función para avanzar al siguiente video
function nextVideo() {
    videos[currentVideoIndex].pause();
    videos[currentVideoIndex].currentTime = 0;

    // Actualizar el índice del video actual
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;

    // Actualizar los dots para reflejar el nuevo video activo
    updateDots();

    // Mover el slider al nuevo video
    document.querySelector('.video-slider').style.transform = `translateX(-${currentVideoIndex * 90}%)`;

    // Reproducir el siguiente video
    playVideo(videos[currentVideoIndex]);
}

// Función para actualizar los dots
function updateDots() {
    console.log(`Actualizando dots. Índice del video activo: ${currentVideoIndex}`); // Verificar si la función se llama correctamente
    // Recorrer los dots y actualizar su estado según el índice del video actual
    dots.forEach((dot, index) => {
        if (index === currentVideoIndex) {
            dot.classList.add('active');  // Colorea el dot del video activo
        } else {
            dot.classList.remove('active');  // Los demás dots vuelven a gris
        }
    });
}

// Evento de play/pause con el botón
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        videos[currentVideoIndex].pause();
        clearInterval(interval);
        playPauseBtn.classList.remove('pause'); // Quita la clase pause
        playPauseBtn.classList.add('play');     // Agrega la clase play
    } else {
        playVideo(videos[currentVideoIndex]);
        playPauseBtn.classList.remove('play');  // Quita la clase play
        playPauseBtn.classList.add('pause');    // Agrega la clase pause
    }
    isPlaying = !isPlaying;
});


// Iniciar la reproducción del primer video y activar el primer dot
playVideo(videos[currentVideoIndex]);
updateDots();
