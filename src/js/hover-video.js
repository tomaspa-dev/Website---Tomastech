// Galeria de imagenes
// Seleccionamos todos los videos de hover
const hoverVideos = document.querySelectorAll('.hover-video');
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
// Aplicación en hover videos
hoverVideos.forEach(video => {
    video.addEventListener('mouseenter', debounce(() => {
        video.playbackRate = 2;
        video.play();
    }, 200));
});