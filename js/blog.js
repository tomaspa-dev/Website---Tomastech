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
