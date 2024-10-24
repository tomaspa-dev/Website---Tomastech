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

//7 - Carousel video
let currentVideoIndex = 0;
const videos = document.querySelectorAll('.video-card video');
const progressBar = document.querySelector('.progress-bar');
const playPauseBtn = document.getElementById('playPauseBtn');
const dots = document.querySelectorAll('.dot-video');
let isPlaying = true;
let interval;

// Inicialmente, pausa todos los videos y asegúrate de que no se reproduzcan automáticamente
videos.forEach(video => {
    video.pause();
    video.currentTime = 0; // Reinicia la posición a 0
});

//Función para reproducir el video
function playVideo(video) {
    video.play();
    updateProgress(video);
}

//Función para actualizar la barra de progreso
function updateProgress(video) {
    interval = setInterval(() => {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${progress}%`;

        if (video.ended) {
            clearInterval(interval);
            nextVideo();
        }
    }, 500);
}

//Función para avanzar al siguiente video
function nextVideo() {
    videos[currentVideoIndex].pause();
    videos[currentVideoIndex].currentTime = 0;

    //Actualizar el índice del video actual
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;

    //Actualizar los dots para reflejar el nuevo video activo
    updateDots();

    //Mover el slider al nuevo video
    document.querySelector('.video-slider').style.transform = `translateX(-${currentVideoIndex * 90}%)`;

    //Reproducir el siguiente video
    playVideo(videos[currentVideoIndex]);
}

//Función para actualizar los dots
function updateDots() {
    //Recorrer los dots y actualizar su estado según el índice del video actual
    dots.forEach((dot, index) => {
        if (index === currentVideoIndex) {
            dot.classList.add('active');  //Colorea el dot del video activo
        } else {
            dot.classList.remove('active'); //Los demás dots vuelven a gris
        }
    });
}

// Evento de play / pause con el botón
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        videos[currentVideoIndex].pause();
        clearInterval(interval);
        playPauseBtn.classList.remove('pause'); //Quita la clase pause
        playPauseBtn.classList.add('play');     //Agrega la clase play
    } else {
        playVideo(videos[currentVideoIndex]);
        playPauseBtn.classList.remove('play');  //Quita la clase play
        playPauseBtn.classList.add('pause');    //Agrega la clase pause
    }
    isPlaying = !isPlaying;
});

// Iniciar la reproducción del primer video y activar el primer dot
playVideo(videos[currentVideoIndex]);
updateDots();

// --- NUEVA PARTE ---
// Añadir el evento de clic en los dots para cambiar al video seleccionado
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        // Pausar el video actual
        videos[currentVideoIndex].pause();
        videos[currentVideoIndex].currentTime = 0;
        clearInterval(interval);

        // Actualizar el índice al dot clickeado
        currentVideoIndex = index;

        // Actualizar los dots visualmente
        updateDots();

        // Mover el carrusel al nuevo video
        document.querySelector('.video-slider').style.transform = `translateX(-${currentVideoIndex * 90}%)`;

        // Reproducir el video seleccionado
        playVideo(videos[currentVideoIndex]);
    });
});


//8 - 3d Model
//Configurar escena y cámara
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); //Relación de aspecto 1 para mantener cuadrado
camera.position.z = 2;

//Configurar renderer con fondo transparente y antialiasing para mejorar la calidad
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('iphoneCanvas'),
    alpha: true,
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio); //Mejorar la resolución para pantallas de alta densidad
const container = document.querySelector('.phones-container');
renderer.setSize(container.clientWidth, container.clientHeight); 

//Ajustar tamaño del canvas al redimensionar ventana
window.addEventListener('resize', () => {
    camera.aspect = 1; //Mantener la proporción cuadrada
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

//Agregar controles Orbit
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; //Activa la amortiguación (rotación suave)
controls.enablePan = false;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 5;
controls.enableZoom = false; //Desactiva el zoom con scroll

//Evento para cambiar el cursor a 'grabbing' cuando se interactúa con el canvas
controls.addEventListener('start', () => {
    document.querySelector('.phones-container').style.cursor = 'grabbing';
});

//Evento para volver a 'grab' cuando se termina la interacción
controls.addEventListener('end', () => {
    document.querySelector('.phones-container').style.cursor = 'grab';
});

//Inicialmente, establecer el cursor en 'grab'
document.querySelector('.phones-container').style.cursor = 'grab';

//Función para agregar luces al entorno
function addEnvironmentLights() {
    // Luz ambiental suave para iluminar toda la escena
    const ambientLight = new THREE.AmbientLight(0xffffff, 3.5); 
    scene.add(ambientLight);

    // Luz direccional desde arriba para simular iluminación del entorno
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(0, 5, 5); 
    scene.add(topLight);

    // Luz direccional desde el frente para iluminar los objetos desde un ángulo más frontal
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.2);
    frontLight.position.set(0, 0, 5);
    scene.add(frontLight);

    // Luz puntual (opcional) para crear focos de luz más concentrados si es necesario
    const pointLight = new THREE.PointLight(0xffffff, 1.0, 50);
    pointLight.position.set(0, 0, 3); 
    scene.add(pointLight);
}

// Llamada para agregar las luces del entorno
addEnvironmentLights();

//Cargar modelos de dispositivos GLTF
const loader = new THREE.GLTFLoader();
const devices = ['asset/iphone_13_pro_max.glb', 'asset/ipad_pro.glb']; //Modelos de los dispositivos
let currentModel = null;
let currentDeviceIndex = 0;

//Función para asegurar que la escala del dispositivo sea correcta
function setDeviceScale(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const desiredHeight = 2;
    const scaleFactor = desiredHeight / size.y;  //Factor de escala en función de la altura
    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x * scaleFactor, -center.y * scaleFactor, 0);
}

function addVideoTexture(model) {
    const video = document.getElementById('videoTexture');
    video.play(); //Iniciar la reproducción del video

    const texture = new THREE.VideoTexture(video);
    model.traverse((child) => {
        if (child.isMesh && child.name === 'Body_Wallpaper_0') {
            child.material.map = texture; //Asignar la textura del video al mesh
            child.material.needsUpdate = true;
        }
    });
}


function addImageOrVideoTexture(model) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/img/tablet-img.webp');

    //Configurar rotación para ambos casos (imagen o video)
    texture.center.set(0.5, 0.5); //Establecer el centro para rotar
    texture.rotation = Math.PI; //Rotar 180 grados

    model.traverse((child) => {
        if (child.isMesh && (child.name === 'iPad_Pro_2020_screen_0')) {
            child.material = new THREE.MeshBasicMaterial({ map: texture });
            child.material.needsUpdate = true;
        }
    });
}


//Función para cargar el dispositivo con transición suave
function loadDevice(index) {
    if (currentModel) {
        gsap.to(currentModel.position, {
            x: -5,
            duration: 0.5,
            onComplete: () => {
                scene.remove(currentModel);
                loader.load(devices[index], function (gltf) {
                    currentModel = gltf.scene;
                    currentModel.position.set(5, 0, 0);
                    setDeviceScale(currentModel);
                    enhanceDeviceMaterials(currentModel);
                    // Determinar si es un video o una imagen
                    // Para el iPhone
                    if (index === 0) {
                        addVideoTexture(currentModel);
                    } 
                    // Para el iPad
                    else if (index === 1) { 
                        addImageOrVideoTexture(currentModel); //Usar imagen
                    }
                    scene.add(currentModel);
                    gsap.to(currentModel.position, { x: 0, duration: 0.5 });
                });
            }
        });
    } else {
        loader.load(devices[index], function (gltf) {
            currentModel = gltf.scene;
            setDeviceScale(currentModel);
            enhanceDeviceMaterials(currentModel);
            if (index === 0) {
                addVideoTexture(currentModel);
            } else if (index === 1) {
                addImageOrVideoTexture(currentModel); //Usar imagen
            }
            scene.add(currentModel);
        });
    }
}

//Cargar el primer dispositivo al inicio
loadDevice(currentDeviceIndex);

//Función para mejorar los materiales del dispositivo (reflejos y metalización)
function enhanceDeviceMaterials(model) {
    model.traverse((child) => {
        if (child.isMesh) {
            if (child.name === 'Body_Body_0' || child.name === 'iPad_Pro_2020_Body_0' || child.name === 'Apple_Pencil_apple_pencil_0') {  
                //Cambiar solo la carcasa trasera
                child.material.roughness = 0.7;  //Valor más bajo equivale a más reflejos
                child.material.metalness = 0.8;  //Aumenta el efecto metálico
            } else if (child.name.includes('Bezels') || child.name.includes('edge')) {  
                child.material.roughness = 0.2; //Partes metálicas
                child.material.metalness = 1.0;  //Metalización más fuerte en bordes metálicos
            }
        }
    });
}

// Función para preservar el color de la pantalla del dispositivo y cambiar solo la carcasa
function changeColor(color) {
    if (currentModel) {
        currentModel.traverse((child) => {
            if (child.isMesh && (child.name === 'Body_Body_0' || child.name === 'iPad_Pro_2020_Body_0')) {  //Afectar solo la carcasa trasera
                child.material.color.set(color);  //Cambiar el color de la carcasa
                child.material.needsUpdate = true;  //Asegurar que el cambio se refleje
            }
        });
    }
}

// Botones de color
const colors = ['#b50721', '#c0892b', '#0fa356'];
const colorButtons = document.getElementById('colorButtons');

// Crear botones para cambiar el color
colors.forEach(color => {
    const button = document.createElement('button');
    button.style.backgroundColor = color;
    button.setAttribute('aria-label', `Change color to ${colorName(color)}`);
    button.addEventListener('click', () => changeColor(color));
    colorButtons.appendChild(button);
});

// Función auxiliar para asignar nombres a los colores
function colorName(hexColor) {
    switch (hexColor) {
        case '#b50721': return 'Red';
        case '#c0892b': return 'Gold';
        case '#0fa356': return 'Green';
        default: return 'Unknown Color';
    }
}

// Botón para cambiar de dispositivo
const rotateBtn = document.getElementById('rotateDevice');
rotateBtn.addEventListener('click', () => {
    currentDeviceIndex = (currentDeviceIndex + 1) % devices.length;  //Cambia al siguiente dispositivo
    loadDevice(currentDeviceIndex);
});

// Animación del render
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

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


