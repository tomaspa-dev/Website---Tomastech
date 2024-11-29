//Faq abrir y ocultar preguntas
document.querySelector('.faq-questions').addEventListener('change', (event) => {
    if (event.target.classList.contains('faq-input')) {
        // Desmarcar otros checkboxes si uno se activa
        document.querySelectorAll('.faq-input').forEach((otherInput) => {
            if (otherInput !== event.target) {
                otherInput.checked = false;
            }
        });
    }
});