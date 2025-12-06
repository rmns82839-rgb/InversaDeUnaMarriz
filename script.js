// Valores de ejemplo para la matriz 3x3 de tu ejercicio
const defaultMatrix3x3 = [
    [0, 5, -4],
    [1, -7, 9],
    [2, 0, 2]
];

// Función para calcular el Máximo Común Divisor (necesario para simplificar fracciones)
function gcd(a, b) {
    // Asegura que 'a' y 'b' sean enteros positivos para el cálculo
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    return b ? gcd(b, a % b) : a;
}

/**
 * Función auxiliar para dar formato a los números, evita ceros no significativos.
 */
function formatNumber(num) {
    if (Math.abs(num) < 1e-9) {
        return '0'; 
    }
    // Si es un entero, lo devuelve como entero
    if (num % 1 === 0) {
        return num.toString();
    }
    // Si no, usa precisión para manejar decimales
    return Number(num).toPrecision(5).replace(/\.0+$/, ''); 
}

/**
 * Convierte un número y un denominador a una fracción simplificada.
 * Devuelve un objeto { numerator: number, denominator: number, latex: string }
 */
function toFraction(num, den) {
    if (den === 0) return { numerator: num, denominator: 0, latex: `\\frac{${formatNumber(num)}}{0}` };
    if (num === 0) return { numerator: 0, denominator: 1, latex: '0' };
    
    // Convertir a enteros para evitar errores de coma flotante en el MCD
    const factor = 10000; 
    let n = Math.round(num * factor);
    let d = Math.round(den * factor);

    const common = gcd(n, d);
    n = n / common;
    d = d / common;

    // Asegurar que el signo esté en el numerador
    if (d < 0) {
        n = -n;
        d = -d;
    }

    // Simplificar el caso de enteros
    if (d === 1) {
        return { numerator: n, denominator: 1, latex: n.toString() };
    }

    return { 
        numerator: n, 
        denominator: d, 
        latex: `\\frac{${n}}{${d}}` 
    };
}


// --- Funciones de Almacenamiento Local (Persistencia) ---

function saveMatrixData() {
    const size = parseInt(document.getElementById('matrixSize').value);
    const matrixData = getMatrix();
    localStorage.setItem('matrixSize', size);
    localStorage.setItem('matrixData', JSON.stringify(matrixData));
    
    // Guardar también los datos del estudiante
    const studentInfo = {
        alumno: document.getElementById('info-alumno').value,
        materia: document.getElementById('info-materia').value,
        carrera: document.getElementById('info-carrera').value,
        sede: document.getElementById('info-sede').value,
        jornada: document.getElementById('info-jornada').value,
    };
    localStorage.setItem('studentInfo', JSON.stringify(studentInfo));
}

function saveMatrixSize() {
    // Guarda el tamaño cuando se cambia el selector
    const size = document.getElementById('matrixSize').value;
    localStorage.setItem('matrixSize', size);
}

function loadState() {
    // Cargar tamaño de matriz
    const storedSize = localStorage.getItem('matrixSize');
    if (storedSize) {
        document.getElementById('matrixSize').value = storedSize;
    }
    // ESTA FUNCIÓN DEBE EJECUTARSE PARA DIBUJAR LOS INPUTS DE LA MATRIZ
    generateMatrixInputs(); 

    // Cargar datos de la matriz
    const storedData = localStorage.getItem('matrixData');
    if (storedData) {
        const matrix = JSON.parse(storedData);
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                const id = `a${i}${j}`;
                const input = document.getElementById(id);
                if (input) {
                    input.value = matrix[i][j];
                }
            }
        }
    }

    // Cargar datos del estudiante
    const storedInfo = localStorage.getItem('studentInfo');
    if (storedInfo) {
        const info = JSON.parse(storedInfo);
        document.getElementById('info-alumno').value = info.alumno || '';
        document.getElementById('info-materia').value = info.materia || '';
        document.getElementById('info-carrera').value = info.carrera || '';
        document.getElementById('info-sede').value = info.sede || '';
        document.getElementById('info-jornada').value = info.jornada || '';
    }
}


// --- Funciones de Utilidad (Inputs y Display) ---

function generateMatrixInputs() {
    const size = parseInt(document.getElementById('matrixSize').value);
    const inputDiv = document.getElementById('matrix-input');
    inputDiv.innerHTML = '';
    
    // Esto es clave: define el grid para que los inputs se coloquen
    inputDiv.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `a${i}${j}`;
            input.placeholder = `A[${i+1}, ${j+1}]`;
            
            // Carga el valor por defecto solo si no hay datos guardados
            let defaultValue = 0;
            if (size === 3 && defaultMatrix3x3[i] && defaultMatrix3x3[i][j] !== undefined) {
                 defaultValue = defaultMatrix3x3[i][j];
            }
            input.value = defaultValue;
            
            // Guardar al cambiar cualquier input
            input.oninput = saveMatrixData;
            
            inputDiv.appendChild(input);
        }
    }
}

function getMatrix() {
    const size = parseInt(document.getElementById('matrixSize').value);
    const matrix = [];
    for (let i = 0; i < size; i++) {
        let row = [];
        for (let j = 0; j < size; j++) {
            const id = `a${i}${j}`;
            const input = document.getElementById(id);
            const value = input ? Number(input.value) : 0;
            row.push(value);
        }
        matrix.push(row);
    }
    return matrix;
}

function generateLatexMatrix(matrix) {
    if (!matrix || matrix.length === 0) return '';
    
    let content = '';

    matrix.forEach((row, rIndex) => {
        content += row.join(' & ');
        if (rIndex < matrix.length - 1) {
            content += ' \\\\ ';
        }
    });

    return `$$\\begin{pmatrix} ${content} \\end{pmatrix}$$`;
}


// --- Visualización de Sarrus (3x5) ---
function generateSarrusVisual(A) {
    const sarrus = [];
    // Duplicar las primeras dos columnas
    A.forEach(row => sarrus.push([...row, row[0], row[1]]));

    let html = '<div class="sarrus-container"><div class="sarrus-matrix">';

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
            const value = formatNumber(sarrus[i][j]);
            
            // Clases para las diagonales: p1, p2, p3 (positivas); n1, n2, n3 (negativas)
            let sarrus_class = '';
            
            // Positivas (suma) - Colores distintos (p1, p2, p3)
            if ((i === 0 && j === 0) || (i === 1 && j === 1) || (i === 2 && j === 2)) sarrus_class += ' p1';
            if ((i === 0 && j === 1) || (i === 1 && j === 2) || (i === 2 && j === 3)) sarrus_class += ' p2';
            if ((i === 0 && j === 2) || (i === 1 && j === 3) || (i === 2 && j === 4)) sarrus_class += ' p3';
            
            // Negativas (resta) - Colores distintos (n1, n2, n3)
            if ((i === 0 && j === 2) || (i === 1 && j === 1) || (i === 2 && j === 0)) sarrus_class += ' n1';
            if ((i === 0 && j === 3) || (i === 1 && j === 2) || (i === 2 && j === 1)) sarrus_class += ' n2';
            if ((i === 0 && j === 4) || (i === 1 && j === 3) || (i === 2 && j === 2)) sarrus_class += ' n3';
            
            html += `<span class="${sarrus_class.trim()}">${value}</span>`;
        }
    }

    html += '</div></div>';
    return html;
}

// --- Visualización de Menor 2x2 con Colores Únicos ---
function generateMinorVisual(A, r, c) {
    const tempMatrix = [];
    for (let i = 0; i < 3; i++) {
        if (i !== r) {
            tempMatrix.push(A[i].filter((_, j) => j !== c));
        }
    }
    
    // a, b, c, d son los elementos del menor
    const elem_a = formatNumber(tempMatrix[0][0]); // Top-Left
    const elem_b = formatNumber(tempMatrix[0][1]); // Top-Right
    const elem_c = formatNumber(tempMatrix[1][0]); // Bottom-Left
    const elem_d = formatNumber(tempMatrix[1][1]); // Bottom-Right
    
    // Usamos clases de color únicas para las dos diagonales de 2x2:
    // Positiva (a * d): minor-pos-A y minor-pos-B (mismo color)
    // Negativa (c * b): minor-neg-A y minor-neg-B (mismo color, diferente al anterior)
    return `
        <div class="minor-elements">
            <span class="minor-pos-A">${elem_a}</span>
            <span class="minor-neg-B">${elem_b}</span>
            <span class="minor-neg-A">${elem_c}</span>
            <span class="minor-pos-B">${elem_d}</span>
        </div>
    `;
}

// --- Lógica de Cálculo (3x3) ---

function calculateDeterminant(A) {
    // Texto de error sin caracteres LaTeX innecesarios
    if (A.length !== 3) return { det: NaN, step: "El cálculo detallado del determinante de N distinto de 3 no está implementado." };

    // CORREGIDO: Usar variables largas para evitar el error de "has already been declared"
    const a11 = A[0][0], a12 = A[0][1], a13 = A[0][2];
    const a21 = A[1][0], a22 = A[1][1], a23 = A[1][2];
    const a31 = A[2][0], a32 = A[2][1], a33 = A[2][2];

    const term1 = a11 * a22 * a33;
    const term2 = a12 * a23 * a31;
    const term3 = a13 * a21 * a32;
    const posSum = term1 + term2 + term3;
    
    const term4 = a13 * a22 * a31;
    const term5 = a11 * a23 * a32;
    const term6 = a12 * a21 * a33;
    const negSum = term4 + term5 + term6;
    
    const det = posSum - negSum;
    
    const step = `
        <p><strong>Visualización de la Regla de Sarrus:</strong></p>
        ${generateSarrusVisual(A)}
        $$\\text{det}(A) = (${formatNumber(term1)} + ${formatNumber(term2)} + ${formatNumber(term3)}) - (${formatNumber(term4)} + ${formatNumber(term5)} + ${formatNumber(term6)})$$
        $$\\text{det}(A) = (${formatNumber(posSum)}) - (${formatNumber(negSum)})$$
        $$\\text{det}(A) = ${formatNumber(posSum - negSum)}$$
        $$\\text{det}(A) = \\mathbf{${formatNumber(det)}}$$
    `;

    return { det, step };
}

function calculateCofactorMatrix(A) {
    // Texto de error sin caracteres LaTeX innecesarios
    if (A.length !== 3) return { C: null, steps: ["El cálculo detallado de cofactores de N distinto de 3 no está implementado."] };
    
    const minors = [];
    const steps = [];
    
    // Fila y columna de cada cofactor
    const indices = [
        { r: 0, c: 0, sign: '+' }, { r: 0, c: 1, sign: '-' }, { r: 0, c: 2, sign: '+' },
        { r: 1, c: 0, sign: '-' }, { r: 1, c: 1, sign: '+' }, { r: 1, c: 2, sign: '-' },
        { r: 2, c: 0, sign: '+' }, { r: 2, c: 1, sign: '-' }, { r: 2, c: 2, sign: '+' }
    ];

    indices.forEach(idx => {
        const subMatrix = [];
        for (let i = 0; i < 3; i++) {
            if (i !== idx.r) {
                subMatrix.push(A[i].filter((_, j) => j !== idx.c));
            }
        }

        const elem_a = subMatrix[0][0];
        const elem_b = subMatrix[0][1];
        const elem_c = subMatrix[1][0];
        const elem_d = subMatrix[1][1];
        
        const prod1 = elem_a * elem_d;
        const prod2 = elem_c * elem_b;
        const minorVal = prod1 - prod2;
        const cofactor = (idx.sign === '-') ? -minorVal : minorVal;
        minors.push(cofactor);

        // Generación del paso a paso detallado con la visualización 2x2
        const visualMinor = generateMinorVisual(A, idx.r, idx.c);

        steps.push(`
            <div class="minor-step-detail">
                $$\\mathbf{C}_{${idx.r + 1}${idx.c + 1}} = ${idx.sign}\\begin{vmatrix} ${formatNumber(elem_a)} & ${formatNumber(elem_b)} \\\\ ${formatNumber(elem_c)} & ${formatNumber(elem_d)} \\end{vmatrix}$$
                ${visualMinor}
                $$= ${idx.sign}((${formatNumber(elem_a)})(${formatNumber(elem_d)}) - (${formatNumber(elem_c)})(${formatNumber(elem_b)}))$$
                $$= ${idx.sign}(${formatNumber(prod1)} - ${formatNumber(prod2)})$$
                $$= ${idx.sign}(${formatNumber(minorVal)}) = \\mathbf{${formatNumber(cofactor)}}$$
            </div>
        `);
    });

    const C = [
        minors.slice(0, 3).map(formatNumber),
        minors.slice(3, 6).map(formatNumber),
        minors.slice(6, 9).map(formatNumber)
    ];

    return { C, steps };
}


function calculateInverse() {
    saveMatrixData(); // Guarda la matriz actual antes de calcular
    
    const A = getMatrix();
    const size = A.length;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; 

    // Muestra la matriz de entrada al inicio.
    let html = `<div class="step">
        <h2>Matriz de Entrada A (${size} x ${size})</h2>
        <div class="matrix-formula">${generateLatexMatrix(A.map(row => row.map(formatNumber)))}</div>
    </div>`;
    
    if (size !== 3) {
        html += `<div class="step" style="border-left-color: #dc3545; background-color: #f8d7da;">
            <h2>Cálculo Limitado</h2>
            <p>El método de la Matriz Adjunta (paso a paso de cofactores) es **computacionalmente inviable** para matrices de orden superior. La salida solo muestra la matriz de entrada. Por favor, seleccione **3 x 3** para el cálculo detallado.</p>
        </div>`;
        resultsDiv.innerHTML = html;
        if (typeof MathJax !== 'undefined') MathJax.typesetPromise([resultsDiv]);
        return;
    }

    // --- CÁLCULO DETALLADO SOLO PARA 3x3 ---

    // 1. Determinante
    const { det, step: detStep } = calculateDeterminant(A);

    html += `<div class="step">
        <h2>1. Cálculo del Determinante (det(A))</h2>
        <p>Desarrollo del determinante por la Regla de Sarrus: (iniciamos la multiplicación desde el primer número en verde)</p>
        <div class="matrix-formula">${detStep}</div>
    </div>`;

    if (Math.abs(det) < 1e-9) { 
        html += `<div class="step" style="border-left-color: #dc3545; background-color: #f8d7da;">
            <h2>Resultado Final</h2>
            <p><strong>El determinante es CERO (${formatNumber(det)}).</strong> La matriz **NO** tiene inversa.</p>
        </div>`;
        resultsDiv.innerHTML = html;
        if (typeof MathJax !== 'undefined') MathJax.typesetPromise([resultsDiv]);
        return;
    }

    // 2. Cofactores
    const { C, steps: CSteps } = calculateCofactorMatrix(A);
    
    // Texto de descripción de Paso 2, usa solo texto plano
    html += `<div class="step">
        <h2>2. Cálculo de la Matriz de Cofactores (C)</h2>
        <p>Cada cofactor C_ij se calcula como (signo)^i+j por el Menor M_ij:</p>
        <div class="cofactor-grid">${CSteps.join('\n')}</div>
        <p><strong>Matriz de Cofactores (C):</strong></p>
        <div class="matrix-formula">${generateLatexMatrix(C)}</div>
    </div>`;

    // 3. Adjunta
    const adjA = [
        [C[0][0], C[1][0], C[2][0]],
        [C[0][1], C[1][1], C[2][1]],
        [C[0][2], C[1][2], C[2][2]]
    ];

    // Texto de descripción de Paso 3, usa solo texto plano
    html += `<div class="step">
        <h2>3. Cálculo de la Matriz Adjunta (adj(A))</h2>
        <p>La matriz adjunta es la transpuesta de la Matriz de Cofactores (C transpuesta):</p>
        <div class="matrix-formula">${generateLatexMatrix(adjA)}</div>
    </div>`;

    // 4. Inversa
    const invAFractionsLatex = adjA.map(row => row.map(valStr => {
        const fraction = toFraction(Number(valStr), det);
        return fraction.latex;
    }));

    const invADecimal = adjA.map(row => row.map(valStr => Number(valStr) / det).map(formatNumber));

    // Texto de descripción de Paso 4, solo fórmulas usan MathJax
    html += `<div class="step" style="border-left-color: #f1c40f; background-color: #fffaf0;">
        <h2>4. Cálculo de la Matriz Inversa (A⁻¹)</h2>
        <p>La inversa se calcula con la fórmula: $$A^{-1} = \\frac{1}{\\text{det}(A)} \\cdot \\text{adj}(A)$$</p>
        <p><strong>Matriz Inversa (A⁻¹) en Fracciones Simplificadas:</strong></p>
        <div class="matrix-formula">${generateLatexMatrix(invAFractionsLatex)}</div>
        <p><strong>Matriz Inversa (A⁻¹) en Decimales (aproximada):</strong></p>
        <div class="matrix-formula">${generateLatexMatrix(invADecimal)}</div>
    </div>`;

    resultsDiv.innerHTML = html;
    if (typeof MathJax !== 'undefined') MathJax.typesetPromise([resultsDiv]);
}

// --- Funciones de Control ---

function resetInputs() {
    // Reinicia los inputs de la matriz a 0 y los datos del estudiante a vacío
    const size = parseInt(document.getElementById('matrixSize').value);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const input = document.getElementById(`a${i}${j}`);
            if (input) input.value = 0;
        }
    }
    document.getElementById('info-alumno').value = '';
    document.getElementById('info-materia').value = '';
    document.getElementById('info-carrera').value = '';
    document.getElementById('info-sede').value = '';
    document.getElementById('info-jornada').value = '';

    clearResults(); // También borra los resultados
    saveMatrixData(); // Guarda el estado de reseteo
}

function clearResults() {
    document.getElementById('results').innerHTML = '';
}

function printResults() {
    // Primero, asegura que se muestre el resultado actual.
    calculateInverse(); 
    
    // Luego, imprime.
    window.print();
}

// --- Inicialización del DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Cargar el estado guardado al inicio
    loadState();
    
    // Asignar eventos a los botones y selectores
    document.getElementById('matrixSize').addEventListener('change', () => {
        saveMatrixSize(); // Guarda el nuevo tamaño
        generateMatrixInputs(); // Dibuja los inputs para el nuevo tamaño
        clearResults();
    });
    
    document.getElementById('calculate-det').addEventListener('click', calculateInverse);
    document.getElementById('clear-inputs').addEventListener('click', resetInputs);
    document.getElementById('print-btn').addEventListener('click', printResults);
    
    // Guardar información del estudiante al cambiar
    const infoInputs = ['info-alumno', 'info-materia', 'info-carrera', 'info-sede', 'info-jornada'];
    infoInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', saveMatrixData);
    });
});
          
