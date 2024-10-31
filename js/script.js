//1 - Efectos de incremento en numeros en la sección hero
function incrementNumber(element, start, end, increment, duration) {
    let current = start;
    const range = end - start;
    const stepTime = Math.abs(Math.floor(duration / (range / increment)));
    const obj = document.getElementById(element);
    
    const timer = setInterval(() => {
        current += increment;
        obj.textContent = current.toLocaleString();//Formato con separador de miles
        if (current >= end) {
        clearInterval(timer);
        obj.textContent = end.toLocaleString();//Asegura que termine exactamente en el número final
        }
    }, stepTime);
    }
    
    // Llamada a la función con diferentes incrementos
    incrementNumber("number1", 0, 2, 1, 1000);  //Incremento de 1 en 1 hasta 2
    incrementNumber("number2", 0, 20, 2, 1000); //Incremento de 2 5en 2 hasta 20
    incrementNumber("number3", 0, 10, 1, 1500); //Incremento de 1 en 1 hasta 10
    
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

//5 - Copiar datos de contacto
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

// 6 - Efectos, Animaciones en boton confetti
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


//9 - Sticky header
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const heroSection = document.querySelector('.hero-section');
    const stickyPoint = heroSection.offsetTop - header.offsetHeight - 100; // Ajuste aquí
    const headerSpacer = document.createElement('div');
    headerSpacer.style.height = header.offsetHeight + 'px';
    headerSpacer.style.display = 'none'; // Se oculta inicialmente

    // Insertar el spacer después del header
    header.parentNode.insertBefore(headerSpacer, header.nextSibling);

    window.addEventListener('scroll', function() {
        if (window.scrollY >= stickyPoint) {
            header.classList.add('sticky-header');
            headerSpacer.style.display = 'block'; // Mostrar el spacer para ocupar el espacio
        } else {
            header.classList.remove('sticky-header');
            headerSpacer.style.display = 'none'; // Ocultar el spacer cuando no es necesario
        }
    });
});


//10 - Sidebar Navigation Lateral
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const iconHorizontal = document.querySelector('.icon-horizontal');
    const iconVertical = document.querySelector('.icon-vertical');

    sidebar.classList.toggle('open'); //Alterna la clase 'open' para abrir o cerrar el sidebar

    if (sidebar.classList.contains('open')) {
        // Cambiar a ícono vertical y mostrar el sidebar
        iconHorizontal.style.display = 'none';
        iconVertical.style.display = 'inline-block';
    } else {
        // Cambiar a ícono horizontal al cerrar el sidebar
        closeSidebar();
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const iconHorizontal = document.querySelector('.icon-horizontal');
    const iconVertical = document.querySelector('.icon-vertical');

    sidebar.classList.remove('open'); //Remueve la clase 'open' para cerrarla
    
    //Cambiar de vuelta al ícono horizontal
    iconVertical.style.display = 'none';
    iconHorizontal.style.display = 'inline-block';
}

// Cerrar sidebar al hacer clic en los enlaces
document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', closeSidebar);
});

//11 - Faq abrir y ocultar preguntas
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

// 12 - Galeria de imagenes
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

// 13 - GSAP SCroll
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


// 14 - Animar el hover con GSAP
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


// //13 - Optimizar carga de videos
// const CargaVideos = document.querySelectorAll('video');

// // Observador para manejar reproducción por visibilidad
// const observer = new IntersectionObserver(entries => {
//     entries.forEach(entry => {
//     const video = entry.target;

//     if (entry.isIntersecting) {
//         // Evita reproducir videos dentro del slider que no son el video activo
//         const isSliderVideo = video.closest('.video-card') && !video.closest('.video-card').classList.contains('active');
//         if (!video.classList.contains('hover-video') && !isSliderVideo) {
//             video.play();
//         }
//     } else {
//         video.pause();
//     }
//     });
// });

// // Añadir todos los videos al observer
// CargaVideos.forEach(video => {
//     observer.observe(video);
// });

// // Reproducción de videos que se activan por hover
// const hoverVideos = document.querySelectorAll('.hover-video');

// hoverVideos.forEach(video => {
//     video.addEventListener('mouseenter', () => video.play());
//     video.addEventListener('mouseleave', () => video.pause());
// });


