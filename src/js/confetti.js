document.querySelector(".btn-effect").addEventListener("click", async () => {
    // Importación dinámica del módulo canvas-confetti
    const { default: confetti } = await import('canvas-confetti');

    // Lógica de confetti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0a4495', '#b1cffa', '#3c88f2', '#0e61d4', '#d8e7fc']
    });
});