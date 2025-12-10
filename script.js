// Valores de ejemplo para la matriz 3x3 de tu ejercicio
const defaultMatrix3x3 = [
    [0, 5, -4],
    [1, -7, 9],
    [2, 0, 2]
];

// Estado global para el flujo paso a paso
let currentStepIndex = 0; 
const totalSteps = 4;

// --- Funciones Auxiliares Matemáticas ---

function gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    return b ? gcd(b, a % b) : a;
}

function formatNumber(num) {
    if (Math.abs(num) < 1e-9) {
        return '0'; 
    }
    if (num % 1 === 0) {
        return num.toString();
    }
    return Number(num).toPrecision(5).replace(/\.0+$/, ''); 
}

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


// --- Funciones de Utilidad (Flujo, Inputs, Persistencia) ---

function transposeMatrix(M) {
    if (!M || M.length === 0) return [];
    const rows = M.length;
    const cols = M[0].length;
    const MT = [];
    for (let j = 0; j < cols; j++) {
        MT[j] = [];
        for (let i = 0; i < rows; i++) {
            MT[j][i] = M[i][j];
        }
    }
    return MT;
}

function saveMatrixData() {
    const size = parseInt(document.getElementById('matrixSize').value);
    const matrixData = getMatrix().map(row => row.map(val => val.toString()));
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
            const value = input && input.value !== '' ? parseFloat(input.value) : 0;
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


function nextStep() {
    currentStepIndex++;
    
    if (currentStepIndex > totalSteps) {
        currentStepIndex = totalSteps; 
        document.getElementById('next-step-btn').style.display = 'none';
        return;
    }
    
    const nextBtn = document.getElementById('next-step-btn');
    
    const stepToShow = document.getElementById(`step-${currentStepIndex}`);
    if (stepToShow) {
        stepToShow.style.display = 'block';
    }
    
    const resultsDiv = document.getElementById('results');
    if (typeof MathJax !== 'undefined') MathJax.typesetPromise([resultsDiv]);
    
    if (currentStepIndex === totalSteps) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.innerHTML = `Siguiente Paso ⏭️ (${currentStepIndex}/${totalSteps - 1})`;
    }
}


function setupStepControls(hasError) {
    const nextBtn = document.getElementById('next-step-btn');
    const calculateBtn = document.getElementById('calculate-det');
    
    if (hasError) {
        nextBtn.style.display = 'none';
        calculateBtn.style.display = 'block'; 
    } else {
        currentStepIndex = 1; 
        nextBtn.style.display = 'block';
        nextBtn.innerHTML = `Siguiente Paso ⏭️ (1/${totalSteps - 1})`;
        calculateBtn.style.display = 'none'; 
    }
}


// --- Lógica de Visualización ---

/**
 * Genera el HTML de la matriz 5x3, resaltando la diagonal indicada.
 */
function generateSarrusDetailVisual(A, startR, startC, isPositive) {
    const sarrus = [
        ...A, 
        A[0], 
        A[1]  
    ];
    
    let colorClass = '';
    if (isPositive) {
        if (startR === 0 && startC === 0) colorClass = 'P1';
        else if (startR === 1 && startC === 0) colorClass = 'P2';
        else if (startR === 2 && startC === 0) colorClass = 'P3';
    } else {
        if (startR === 0 && startC === 2) colorClass = 'N1';
        else if (startR === 1 && startC === 2) colorClass = 'N2';
        else if (startR === 2 && startC === 2) colorClass = 'N3';
    }
    
    let html = '<div class="sarrus-container"><div class="sarrus-matrix">';

    for (let i = 0; i < 5; i++) {
        if (i === 3) {
             html += `<span class="separator"></span>`; 
        }

        for (let j = 0; j < 3; j++) {
            const value = formatNumber(sarrus[i][j]);
            
            let elementClass = '';
            
            const rowOffset = i - startR;
            if (rowOffset >= 0 && rowOffset < 3) {
                let colTarget;
                if (isPositive) {
                    colTarget = startC + rowOffset;
                } else {
                    colTarget = startC - rowOffset;
                }
                
                if (j === colTarget) {
                    elementClass = `diag-highlight ${colorClass}`;
                }
            }
            
            html += `<span class="${elementClass.trim()}">${value}</span>`;
        }
    }

    html += '</div></div>';
    return html;
}

/**
 * Genera la matriz 3x3 completa, sombreando la fila r y columna c excluidas.
 */
function generateMatrixWithMinorMask(A, r, c) {
    let html = '<div class="matrix-with-mask">';
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const value = formatNumber(A[i][j]);
            let elementClass = '';
            
            if (i === r || j === c) {
                elementClass = 'excluded';
            } else {
                elementClass = 'included';
            }
            
            html += `<span class="${elementClass}">${value}</span>`;
        }
    }
    
    html += '</div>';
    return html;
}

/**
 * Genera el HTML para el menor 2x2 en formato Matriz 2x2 con colores.
 */
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


function generateRawFractionLatex(matrix, det) {
    if (det === 0) return '';
    
    const rawFractions = matrix.map(row => row.map(val => {
        return `\\frac{${formatNumber(val)}}{${formatNumber(det)}}`;
    }));
    
    return generateLatexMatrix(rawFractions);
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
    
    // --- DETALLE DE SARRUS ---
    const visualPos1 = generateSarrusDetailVisual(A, 0, 0, true);
    const visualPos2 = generateSarrusDetailVisual(A, 1, 0, true);
    const visualPos3 = generateSarrusDetailVisual(A, 2, 0, true);

    const visualNeg1 = generateSarrusDetailVisual(A, 0, 2, false);
    const visualNeg2 = generateSarrusDetailVisual(A, 1, 2, false);
    const visualNeg3 = generateSarrusDetailVisual(A, 2, 2, false);
    
    // TEXTO LIMPIO para las explicaciones
    const step = `
        <h3>1.1 Sumas Positivas (+)</h3>
        <p>Se multiplican los elementos de las diagonales que van de izquierda a derecha y se suman:</p>
        
        <div class="sarrus-details-grid">
            <div class="sarrus-detail-block">
                <p>Diagonal 1: (${formatNumber(a11)} &middot; ${formatNumber(a22)} &middot; ${formatNumber(a33)}) = ${formatNumber(term1)}</p>
                ${visualPos1}
            </div>
            <div class="sarrus-detail-block">
                <p>Diagonal 2: (${formatNumber(a21)} &middot; ${formatNumber(a32)} &middot; ${formatNumber(a13)}) = ${formatNumber(term2)}</p>
                ${visualPos2}
            </div>
            <div class="sarrus-detail-block">
                <p>Diagonal 3: (${formatNumber(a31)} &middot; ${formatNumber(a12)} &middot; ${formatNumber(a23)}) = ${formatNumber(term3)}</p>
                ${visualPos3}
            </div>
        </div>
        
        $$ \\text{Suma Positiva} = ${formatNumber(term1)} + ${formatNumber(term2)} + ${formatNumber(term3)} = ${formatNumber(posSum)} $$
        
        <h3>1.2 Sumas Negativas (-)</h3>
        <p>Se multiplican los elementos de las diagonales que van de derecha a izquierda y se restan (o se suman con signo negativo):</p>
        
        <div class="sarrus-details-grid">
            <div class="sarrus-detail-block">
                <p>Diagonal 4: (${formatNumber(a13)} &middot; ${formatNumber(a22)} &middot; ${formatNumber(a31)}) = ${formatNumber(term4)}</p>
                ${visualNeg1}
            </div>
            <div class="sarrus-detail-block">
                <p>Diagonal 5: (${formatNumber(a11)} &middot; ${formatNumber(a23)} &middot; ${formatNumber(a32)}) = ${formatNumber(term5)}</p>
                ${visualNeg2}
            </div>
            <div class="sarrus-detail-block">
                <p>Diagonal 6: (${formatNumber(a12)} &middot; ${formatNumber(a21)} &middot; ${formatNumber(a33)}) = ${formatNumber(term6)}</p>
                ${visualNeg3}
            </div>
        </div>
        
        $$ \\text{Suma Negativa} = -(${formatNumber(term4)} + ${formatNumber(term5)} + ${formatNumber(term6)}) = -${formatNumber(negSum)} $$
        
        <h3>1.3 Resultado Final</h3>
        <p>El determinante es la resta de la Suma Positiva menos la Suma Negativa:</p>
        $$ \\text{det}(A) = (\\text{Suma Positiva}) - (\\text{Suma Negativa}) $$
        $$ \\text{det}(A) = (${formatNumber(posSum)}) - (${formatNumber(negSum)}) $$
        $$ \\text{det}(A) = ${formatNumber(posSum - negSum)} $$
        $$ \\text{det}(A) = \\mathbf{${formatNumber(det)}} $$
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

        const visualMask = generateMatrixWithMinorMask(A, idx.r, idx.c);
        const visualMinor = generateMinorVisual(A, idx.r, idx.c);

        // TEXTO LIMPIO para las explicaciones
        steps.push(`
            <div class="minor-step-detail">
                <h3>Cofactor C${idx.r + 1}${idx.c + 1}</h3>
                <p>Matriz A con Fila ${idx.r + 1} y Columna ${idx.c + 1} excluidas:</p>
                ${visualMask}
                
                $$ M_{${idx.r + 1}${idx.c + 1}} = \\begin{vmatrix} ${formatNumber(elem_a)} & ${formatNumber(elem_b)} \\\\ ${formatNumber(elem_c)} & ${formatNumber(elem_d)} \\end{vmatrix} $$
                
                <p>Cálculo del determinante 2 x 2:</p>
                ${visualMinor}
                
                $$ M_{${idx.r + 1}${idx.c + 1}} = ((${formatNumber(elem_a)})(${formatNumber(elem_d)})) - ((${formatNumber(elem_c)})(${formatNumber(elem_b)})) $$
                $$ = ${formatNumber(prod1)} - ${formatNumber(prod2)} = ${formatNumber(minorVal)} $$
                
                <p>Cofactor final (C${idx.r + 1}${idx.c + 1}):</p>
                $$ C_{${idx.r + 1}${idx.c + 1}} = ${idx.sign}(M_{${idx.r + 1}${idx.c + 1}}) = ${idx.sign}(${formatNumber(minorVal)}) = \\mathbf{${formatNumber(cofactor)}} $$
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
    
    setupStepControls(false); 
    
    let stepsHTML = [];

    // --- PASO 1: Matriz de Entrada y Determinante ---
    const { det, step: detStep } = calculateDeterminant(A);

    let step1Content = `<div id="step-1" class="step">
        <h2>Paso 1: Matriz de Entrada A y Determinante (det(A))</h2>
        <p>Matriz de Entrada A (${size} x ${size})</p>
        <div class="matrix-formula">${generateLatexMatrix(A.map(row => row.map(formatNumber)))}</div>
        <p>Desarrollo del determinante por la Regla de Sarrus:</p>
        <div class="matrix-formula">${detStep}</div>
    </div>`;
    stepsHTML.push(step1Content);
    
    
    if (size !== 3 || Math.abs(det) < 1e-9) { 
        let errorContent = '';
        if (size !== 3) {
             errorContent = `<div class="step" style="border-left-color: #dc3545; background-color: #f8d7da;">
                <h2>Cálculo Limitado</h2>
                <p>El método de la Matriz Adjunta solo está implementado para matrices 3 x 3.</p>
            </div>`;
        } else {
             errorContent = `<div class="step" style="border-left-color: #dc3545; background-color: #f8d7da;">
                <h2>Resultado Final</h2>
                <p>El determinante es CERO (${formatNumber(det)}). La matriz NO tiene inversa, es singular.</p>
            </div>`;
        }
        
        resultsDiv.innerHTML = step1Content + errorContent;
        setupStepControls(true); 
        if (typeof MathJax !== 'undefined') MathJax.typesetPromise([resultsDiv]);
        return;
    }

    // --- PASO 2: Cofactores ---
    const { C_raw, C_display, steps: CSteps } = calculateCofactorMatrix(A);
    let step2Content = `<div id="step-2" class="step hidden-step">
        <h2>Paso 2: Matriz de Cofactores (C)</h2>
        <h3>2.1 Matriz de Signos</h3>
        <p>Los cofactores se calculan aplicando el signo $C_{ij} = (-1)^{i+j} M_{ij}$. La matriz de signos es</p>
        <div class="matrix-formula sign-matrix">${getSignMatrixLatex()}</div>
        
        <h3>2.2 Cálculo Detallado de los 9 Cofactores</h3>
        <p>Cada cofactor se calcula a partir del determinante del menor M_ij correspondiente.</p>
        <div class="cofactor-grid">${CSteps.join('\n')}</div>
        <p>Matriz de Cofactores (C)</p>
        <div class="matrix-formula">${generateLatexMatrix(C_display)}</div>
    </div>`;
    stepsHTML.push(step2Content);


    // --- PASO 3: Adjunta (Transpuesta de Cofactores) ---
    const adjA_raw = transposeMatrix(C_raw); 
    const adjA_display = adjA_raw.map(row => row.map(formatNumber));
    let step3Content = `<div id="step-3" class="step hidden-step">
        <h2>Paso 3: Matriz Adjunta (adj(A))</h2>
        <p>La Matriz Adjunta es la transpuesta de la Matriz de Cofactores: Adj(A) = C^T</p>
        <div class="matrix-formula">${generateLatexMatrix(adjA_display)}</div>
    </div>`;
    stepsHTML.push(step3Content);

    // --- PASO 4: Inversa (División por el Determinante) ---
    const invARawFractionLatex = generateRawFractionLatex(adjA_raw, det); 

    const invAFractionsLatex = adjA_raw.map(row => row.map(val => {
        const fraction = toFraction(val, det);
        return fraction.latex;
    }));

    const invADecimal = adjA_raw.map(row => row.map(val => val / det).map(formatNumber));

    let step4Content = `<div id="step-4" class="step hidden-step" style="border-left-color: #f1c40f; background-color: #fffaf0;">
        <h2>Paso 4: Matriz Inversa (A⁻¹)</h2>
        <p>Se divide la Matriz Adjunta por el Determinante (1/det(A)):</p>
        $$ A^{-1} = \\frac{1}{\\text{det}(A)} \\cdot \\text{adj}(A) = \\frac{1}{${formatNumber(det)}} \\cdot ${generateLatexMatrix(adjA_display)} $$
        
        <h3>4.1 Matriz Inversa en Fracciones (Sin Simplificar)</h3>
        <div class="matrix-formula">${invARawFractionLatex}</div>

        <h3>4.2 Matriz Inversa en Fracciones (Simplificada)</h3>
        <div class="matrix-formula">${generateLatexMatrix(invAFractionsLatex)}</div>
        
        <p>Matriz Inversa en Decimales (aproximada)</p>
        <div class="matrix-formula">${generateLatexMatrix(invADecimal)}</div>
    </div>`;
    stepsHTML.push(step4Content);

    resultsDiv.innerHTML = stepsHTML.join('');
    
    if (typeof MathJax !== 'undefined') MathJax.typesetPromise([resultsDiv]);
}


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
    document.getElementById('calculate-det').style.display = 'block';
    document.getElementById('next-step-btn').style.display = 'none';
    currentStepIndex = 0;
}

function printResults() {
    if (document.getElementById('results').innerHTML === '') {
        calculateInverse(); 
    }
    
    for (let i = 2; i <= totalSteps; i++) {
        const step = document.getElementById(`step-${i}`);
        if (step) {
            step.classList.remove('hidden-step'); 
            step.style.display = 'block'; 
        }
    }
    
    if (typeof MathJax !== 'undefined') MathJax.typesetPromise([document.getElementById('results')]).then(() => {
        window.print();
    });
}

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
        const input = document.getElementById(id);
        if(input) input.addEventListener('input', saveMatrixData);
    });
    
    if (document.getElementById('results').innerHTML !== '') {
        if (typeof MathJax !== 'undefined') MathJax.typesetPromise([document.getElementById('results')]);
    }
});
