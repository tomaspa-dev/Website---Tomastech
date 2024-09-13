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
    