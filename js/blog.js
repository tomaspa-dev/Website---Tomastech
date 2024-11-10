//1 - Sidebar Navigation Lateral
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
//2 - Sticky header
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const heroSection = document.querySelector('.about-section');
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



