// La función se llama cuando el usuario hace clic en el botón
function calcularConsumo() {
    // 1. Obtener los valores de los inputs
    const potenciaVatios = parseFloat(document.getElementById('potencia').value);
    const horasDiarias = parseFloat(document.getElementById('horas').value);
    const costoPorKwh = parseFloat(document.getElementById('costo').value);
    const resultadoDiv = document.getElementById('resultado');

   // 2. Validar que los valores sean números positivos y válidos
    let errorMensaje = '';

    if (isNaN(potenciaVatios) || potenciaVatios <= 0) {
        errorMensaje += '<li>La potencia (Vatios) debe ser un número mayor a cero.</li>';
    }
    if (isNaN(horasDiarias) || horasDiarias <= 0) {
        errorMensaje += '<li>Las horas de uso diarias deben ser un número mayor a cero.</li>';
    }
    if (isNaN(costoPorKwh) || costoPorKwh < 0) {
        errorMensaje += '<li>El costo por kWh debe ser un número positivo (puede ser cero si el consumo es gratuito).</li>';
    }

    if (errorMensaje) {
        resultadoDiv.innerHTML = `<div class="error">
                                    <p>Por favor, corrige los siguientes errores:</p>
                                    <ul>${errorMensaje}</ul>
                                  </div>`;
        return; // Detiene la función si hay errores
    }
    // FIN DEL PASO 2

   // 3. 🧠 REALIZAR LOS CÁLCULOS
    // Cálculo de Consumo Diario (kWh) y Costo Diario (COP)
    const consumoDiarioKwh = (potenciaVatios * horasDiarias) / 1000;
    const costoDiario = consumoDiarioKwh * costoPorKwh;

    // Consumo y Costo Mensual (asumiendo 30 días)
    const consumoMensualKwh = consumoDiarioKwh * 30;
    const costoMensual = costoDiario * 30;

    // Consumo y Costo Anual (asumiendo 365 días)
    const consumoAnualKwh = consumoDiarioKwh * 365;
    const costoAnual = costoDiario * 365;

    // 4. 💰 Formatear los costos a Pesos Colombianos (COP)
    const formatoCOP = (cantidad) => {
        // Usa 'es-CO' para el formato de Colombia ($ 12.345,67)
        return cantidad.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 2
        });
    };

    const costoDiarioCOP = formatoCOP(costoDiario);
    const costoMensualCOP = formatoCOP(costoMensual);
    const costoAnualCOP = formatoCOP(costoAnual);

    // 5. 📊 Mostrar el Resultado
    resultadoDiv.innerHTML = `
        <h3>Estimación de Consumo y Costo</h3>
        
        <div class="result-card">
            <h4>📅 Consumo Diario</h4>
            <div class="result-item">
                <span class="result-label">⚡ Consumo</span>
                <span class="result-value">${consumoDiarioKwh.toFixed(3)} kWh</span>
            </div>
            <div class="result-item">
                <span class="result-label">💰 Costo</span>
                <span class="result-value">${costoDiarioCOP}</span>
            </div>
        </div>

        <div class="result-card">
            <h4>📆 Consumo Mensual (aprox.)</h4>
            <div class="result-item">
                <span class="result-label">⚡ Consumo</span>
                <span class="result-value">${consumoMensualKwh.toFixed(2)} kWh</span>
            </div>
            <div class="result-item">
                <span class="result-label">💸 Costo</span>
                <span class="result-value">${costoMensualCOP}</span>
            </div>
        </div>

        <div class="result-card">
            <h4>📊 Consumo Anual (aprox.)</h4>
            <div class="result-item">
                <span class="result-label">⚡ Consumo</span>
                <span class="result-value">${consumoAnualKwh.toFixed(2)} kWh</span>
            </div>
            <div class="result-item">
                <span class="result-label">💵 Costo</span>
                <span class="result-value">${costoAnualCOP}</span>
            </div>
        </div>
    `;
}

// Opcional: Ejecutar la función una vez al cargar la página para mostrar un resultado inicial.
window.onload = calcularConsumo;
