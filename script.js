// Valores de ejemplo para la matriz 3x3 de tu ejercicio
const defaultMatrix3x3 = [
    [0, 5, -4],
    [1, -7, 9],
    [2, 0, 2]
];

// Función para calcular el Máximo Común Divisor (necesario para simplificar fracciones)
function gcd(a, b) {
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
    if (num % 1 === 0) {
        return num.toString();
    }
    return Number(num).toPrecision(5).replace(/\.0+$/, ''); 
}

/**
 * Convierte un número y un denominador a una fracción simplificada.
 */
function toFraction(num, den) {
    if (den === 0) return { numerator: num, denominator: 0, latex: `\\frac{${formatNumber(num)}}{0}` };
    if (num === 0) return { numerator: 0, denominator: 1, latex: '0' };
    
    const factor = 10000; 
    let n = Math.round(num * factor);
    let d = Math.round(den * factor);

    const common = gcd(n, d);
    n = n / common;
    d = d / common;

    if (d < 0) {
        n = -n;
        d = -d;
    }

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
    const size = document.getElementById('matrixSize').value;
    localStorage.setItem('matrixSize', size);
}

function loadState() {
    const storedSize = localStorage.getItem('matrixSize');
    if (storedSize) {
        document.getElementById('matrixSize').value = storedSize;
    }
    generateMatrixInputs(); 

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
    
    inputDiv.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `a${i}${j}`;
            input.placeholder = `A[${i+1}, ${j+1}]`;
            
            let defaultValue = 0;
            if (size === 3 && defaultMatrix3x3[i] && defaultMatrix3x3[i][j] !== undefined) {
                 defaultValue = defaultMatrix3x3[i][j];
            }
            input.value = defaultValue;
            
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

function generateLatexMatrix(matrix, delimiter = 'p') {
    if (!matrix || matrix.length === 0) return '';
    
    let content = '';

    matrix.forEach((row, rIndex) => {
        const rowStrings = row.map(item => String(item));
        content += rowStrings.join(' & ');
        if (rIndex < matrix.length - 1) {
            content += ' \\\\ ';
        }
    });

    return `$$\\begin{${delimiter}matrix} ${content} \\end{${delimiter}matrix}$$`;
}

function getSignMatrixLatex() {
    const signs = [
        ['+', '-', '+'],
        ['-', '+', '-'],
        ['+', '-', '+']
    ];
    return generateLatexMatrix(signs, 'v');
}

// --- Visualización de Sarrus (3x5) ---
function generateSarrusVisual(A) {
    const sarrus = [];
    A.forEach(row => sarrus.push([...row, row[0], row[1]]));

    let html = '<div class="sarrus-container"><div class="sarrus-matrix">';

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
            const value = formatNumber(sarrus[i][j]);
            
            let sarrus_class = '';
            
            // Positivas (suma)
            if ((i === 0 && j === 0) || (i === 1 && j === 1) || (i === 2 && j === 2)) sarrus_class += ' p1';
            if ((i === 0 && j === 1) || (i === 1 && j === 2) || (i === 2 && j === 3)) sarrus_class += ' p2';
            if ((i === 0 && j === 2) || (i === 1 && j === 3) || (i === 2 && j === 4)) sarrus_class += ' p3';
            
            // Negativas (resta)
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
    
    const elem_a = formatNumber(tempMatrix[0][0]); 
    const elem_b = formatNumber(tempMatrix[0][1]); 
    const elem_c = formatNumber(tempMatrix[1][0]); 
    const elem_d = formatNumber(tempMatrix[1][1]); 
    
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
    if (A.length !== 3) return { det: NaN, step: "El cálculo detallado del determinante de N distinto de 3 no está implementado." };

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
    
    // Texto de explicación limpio
    const step = `
        <p>Visualización de la Regla de Sarrus:</p>
        ${generateSarrusVisual(A)}
        $$\\text{det}(A) = (${formatNumber(term1)} + ${formatNumber(term2)} + ${formatNumber(term3)}) - (${formatNumber(term4)} + ${formatNumber(term5)} + ${formatNumber(term6)})$$
        $$\\text{det}(A) = (${formatNumber(posSum)}) - (${formatNumber(negSum)})$$
        $$\\text{det}(A) = ${formatNumber(posSum - negSum)}$$
        $$\\text{det}(A) = ${formatNumber(det)}$$
    `;

    return { det, step };
}

function calculateCofactorMatrix(A) {
    if (A.length !== 3) return { C_raw: null, C_display: null, steps: ["El cálculo detallado de cofactores de N distinto de 3 no está implementado."] };
    
    const minors = [];
    const steps = [];
    
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

        const visualMinor = generateMinorVisual(A, idx.r, idx.c);

        steps.push(`
            <div class="minor-step-detail">
                $$C_{${idx.r + 1}${idx.c + 1}} = ${idx.sign}\\begin{vmatrix} ${formatNumber(elem_a)} & ${formatNumber(elem_b)} \\\\ ${formatNumber(elem_c)} & ${formatNumber(elem_d)} \\end{vmatrix}$$
                ${visualMinor}
                $$= ${idx.sign}((${formatNumber(elem_a)})(${formatNumber(elem_d)}) - (${formatNumber(elem_c)})(${formatNumber(elem_b)}))$$
                $$= ${idx.sign}(${formatNumber(prod1)} - ${formatNumber(prod2)})$$
                $$= ${idx.sign}(${formatNumber(minorVal)}) = ${formatNumber(cofactor)}$$
            </div>
        `);
    });

    const C_raw = [
        minors.slice(0, 3),
        minors.slice(3, 6),
        minors.slice(6, 9)
    ];

    const C_display = C_raw.map(row => row.map(formatNumber));

    return { C_raw, C_display, steps };
}


function calculateInverse() {
    saveMatrixData(); 
    
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
            <p>El método de la Matriz Adjunta solo está implementado para matrices 3 x 3.</p>
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
        <p>Desarrollo del determinante por la Regla de Sarrus:</p>
        <div class="matrix-formula">${detStep}</div>
    </div>`;

    if (Math.abs(det) < 1e-9) { 
        html += `<div class="step" style="border-left-color: #dc3545; background-color: #f8d7da;">
            <h2>Resultado Final</h2>
            <p>El determinante es CERO (${formatNumber(det)}). La matriz NO tiene inversa, es singular.</p>
        </div>`;
        resultsDiv.innerHTML = html;
        if (typeof MathJax !== 'undefined') MathJax.typesetPromise([resultsDiv]);
        return;
    }

    // 2. Cofactores
    const { C_raw, C_display, steps: CSteps } = calculateCofactorMatrix(A);
    
    // Matriz de Signos (texto limpio)
    html += `<div class="step">
        <h2>2. Matriz de Cofactores (C)</h2>
        <h3>2.1 Matriz de Signos</h3>
        <p>Los cofactores se calculan aplicando el signo a cada menor. La matriz de signos es</p>
        <div class="matrix-formula sign-matrix">${getSignMatrixLatex()}</div>
        
        <h3>2.2 Cálculo Detallado de los 9 Cofactores</h3>
        <p>Cada cofactor se calcula como el signo por el determinante del menor correspondiente</p>
        <div class="cofactor-grid">${CSteps.join('\n')}</div>
        <p>Matriz de Cofactores (C)</p>
        <div class="matrix-formula">${generateLatexMatrix(C_display)}</div>
    </div>`;

    // 3. Adjunta (Transpuesta de Cofactores)
    const adjA_raw = [
        [C_raw[0][0], C_raw[1][0], C_raw[2][0]],
        [C_raw[0][1], C_raw[1][1], C_raw[2][1]],
        [C_raw[0][2], C_raw[1][2], C_raw[2][2]]
    ];
    const adjA_display = adjA_raw.map(row => row.map(formatNumber));

    // Explicación de Paso 3 (texto limpio)
    html += `<div class="step">
        <h2>3. Matriz Adjunta (adj(A)) (Transpuesta de C)</h2>
        <p>La Matriz Adjunta Traspuesta: convertir las filas en columnas o viceversa.</p>
        $$\\text{adj}(A) = C^T$$
        <div class="matrix-formula">${generateLatexMatrix(adjA_display)}</div>
    </div>`;

    // 4. Inversa (División por el Determinante)
    const invAFractionsLatex = adjA_raw.map(row => row.map(val => {
        const fraction = toFraction(val, det);
        return fraction.latex;
    }));

    const invADecimal = adjA_raw.map(row => row.map(val => val / det).map(formatNumber));

    // Explicación de Paso 4 (texto limpio)
    html += `<div class="step" style="border-left-color: #f1c40f; background-color: #fffaf0;">
        <h2>4. Matriz Inversa (A⁻¹)</h2>
        <p>Finalmente, se divide la Matriz Adjunta por el Determinante (${formatNumber(det)}), el cual actúa como un factor escalar:</p>
        $$A^{-1} = \\frac{1}{\\text{det}(A)} \\cdot \\text{adj}(A) = \\frac{1}{${formatNumber(det)}} \\cdot ${generateLatexMatrix(adjA_display)}$$
        
        <p>Matriz Inversa en Fracciones Simplificadas</p>
        <div class="matrix-formula">${generateLatexMatrix(invAFractionsLatex)}</div>
        <p>Matriz Inversa en Decimales (aproximada)</p>
        <div class="matrix-formula">${generateLatexMatrix(invADecimal)}</div>
    </div>`;

    resultsDiv.innerHTML = html;
    if (typeof MathJax !== 'undefined') MathJax.typesetPromise([resultsDiv]);
}

// --- Funciones de Control (sin cambios) ---

function resetInputs() {
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

    clearResults(); 
    saveMatrixData(); 
}

function clearResults() {
    document.getElementById('results').innerHTML = '';
}

function printResults() {
    calculateInverse(); 
    window.print();
}

// --- Inicialización del DOM (sin cambios) ---
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    
    document.getElementById('matrixSize').addEventListener('change', () => {
        saveMatrixSize(); 
        generateMatrixInputs(); 
        clearResults();
    });
    
    document.getElementById('calculate-det').addEventListener('click', calculateInverse);
    document.getElementById('clear-inputs').addEventListener('click', resetInputs);
    document.getElementById('print-btn').addEventListener('click', printResults);
    
    const infoInputs = ['info-alumno', 'info-materia', 'info-carrera', 'info-sede', 'info-jornada'];
    infoInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', saveMatrixData);
    });
});
