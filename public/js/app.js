/* app.js
   - Tema adaptado al dashboard original.
   - Añadidos: export PNG (gráfico), export CSV (datos filtrados), tabla interactiva (Simple-DataTables).
   - Autodetección de columnas y autocompletado de inputs al cargar CSV.
*/

/* ---- Estado y config ---- */
const DEFAULT_CSV = `date,value,category
2025-01-01,120,solar
2025-01-02,130,solar
2025-01-03,90,wind
2025-01-04,150,solar
2025-01-05,110,hydro
2025-01-06,140,solar
2025-01-07,95,wind
2025-01-08,125,solar
2025-01-09,105,hydro
2025-01-10,155,solar`;

let parsedData = []; // [{col1:..., col2:...}, ...]
let headerRow = [];
let mainChart = null;
let secondaryChart = null;
let dataTable = null; // Simple-DataTables instance

const qs = s => document.querySelector(s);
const statusEl = qs('#status');
function setStatus(msg, isError=false){
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#c53030' : '';
}

/* ---- Utilidades de columnas ---- */
function guessColumns(header){
  const lower = header.map(h=>String(h||'').toLowerCase());
  const dateCandidates = ['year','date','fecha','day','ds','timestamp','año','mes','month'];
  const valueCandidates = ['solar generation','wind generation','hydro generation','geo biomass','generation','value','valor','amount','y','production','power','total','cantidad','count','twh'];
  const catCandidates = ['entity','country','pais','region','category','cat','group','type','categoria','tipo','grupo','code'];

  const findOne = (cands)=>{
    for(const c of cands){
      const i = lower.findIndex(h => h.includes(c));
      if(i !== -1) return header[i];
    }
    return null;
  };
  
  const detected = { 
    date: findOne(dateCandidates), 
    value: findOne(valueCandidates), 
    category: findOne(catCandidates) 
  };
  
  // Log detection results
  console.log('📊 Columnas detectadas:', detected);
  console.log('📋 Columnas disponibles:', header);
  
  return detected;
}

/* Guarda inputs detectados en UI */
function fillDetectedColumns(detected){
  if(detected.date) qs('#col-date').value = detected.date;
  if(detected.value) qs('#col-value').value = detected.value;
  if(detected.category) qs('#col-category').value = detected.category;
}

/* Filtrar por rango de años si hay columna fecha */
function applyDateRangeFilter(rows, colDate){
  const fromYear = parseInt(qs('#date-from').value);
  const toYear = parseInt(qs('#date-to').value);
  if(!fromYear && !toYear) return rows;
  
  return rows.filter(r=>{
    const dateStr = r[colDate];
    if(!dateStr) return false;
    
    // Try to extract year from date string
    const d = new Date(dateStr);
    let year;
    
    if(!isNaN(d)){
      year = d.getFullYear();
    } else {
      // Try to extract year directly from string (e.g., "2025")
      const match = String(dateStr).match(/\b(19|20)\d{2}\b/);
      if(match) year = parseInt(match[0]);
      else return false;
    }
    
    if(fromYear && year < fromYear) return false;
    if(toYear && year > toYear) return false;
    return true;
  });
}

/* Agregaciones */
function aggregateByDate(rows, colDate, colValue){
  const map = new Map();
  rows.forEach(r=>{
    const d = new Date(r[colDate]);
    if(isNaN(d)) return;
    const key = d.toISOString().slice(0,10);
    const val = parseFloat(r[colValue]) || 0;
    map.set(key, (map.get(key)||0) + val);
  });
  const entries = Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  return { labels: entries.map(e=>e[0]), values: entries.map(e=>e[1]) };
}
function aggregateByCategory(rows, colCategory, colValue){
  const map = new Map();
  rows.forEach(r=>{
    const key = r[colCategory] || 'Sin categoría';
    const val = parseFloat(r[colValue]) || 0;
    map.set(key, (map.get(key)||0) + val);
  });
  const entries = Array.from(map.entries()).sort((a,b)=>b[1]-a[1]);
  return { labels: entries.map(e=>e[0]), values: entries.map(e=>e[1]) };
}

/* ---- Charts creation/update ---- */
function updateMainChart(type, labels, values){
  const ctx = qs('#mainChart').getContext('2d');
  const cfgType = type === 'pie' ? 'pie' : (type === 'bar' ? 'bar' : 'line');
  const dataset = {
    label: 'Valores',
    data: values,
    fill: cfgType === 'line',
    tension: 0.25,
    borderColor: '#f2cc0d',
    backgroundColor: cfgType === 'pie' ? undefined : 'rgba(242,204,13,0.15)',
    pointRadius: 3
  };
  const config = {
    type: cfgType,
    data: { labels, datasets: [dataset] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: cfgType === 'pie' } },
      scales: cfgType === 'pie' ? {} : { x: { ticks:{maxRotation:45} }, y: {} }
    }
  };
  if(mainChart){
    mainChart.config.type = config.type;
    mainChart.config.data = config.data;
    mainChart.options = config.options;
    mainChart.update();
  } else {
    mainChart = new Chart(ctx, config);
  }
}
function updateSecondaryChart(labels, values){
  const ctx = qs('#secondaryChart').getContext('2d');
  const config = {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: ['#f2cc0d','#0D6EFD','#6C757D','#34d399','#fb7185','#38bdf8'] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins:{ legend:{ position:'bottom' } } }
  };
  if(secondaryChart){
    secondaryChart.config.data = config.data;
    secondaryChart.update();
  } else {
    secondaryChart = new Chart(ctx, config);
  }
}

/* ---- Tabla interactiva ---- */
function rebuildTable(rows, header){
  // header: array
  const thead = qs('#table-head');
  const tbody = qs('#table-body');
  thead.innerHTML = '';
  tbody.innerHTML = '';

  // head
  const trHead = document.createElement('tr');
  header.forEach(h=>{
    const th = document.createElement('th');
    th.textContent = h;
    th.className = 'px-3 py-2 text-left text-xs';
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  // body
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    header.forEach(h=>{
      const td = document.createElement('td');
      td.textContent = r[h] ?? '';
      td.className = 'border-t px-3 py-1 text-sm';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  // Initialize or re-initialize Simple-DataTables
  // If exists, destroy it first
  if(window.SimpleDatatables && dataTable){
    try { dataTable.destroy(); } catch(e){ /* ignore */ }
  }
  if(window.SimpleDatatables){
    dataTable = new window.simpleDatatables.DataTable("#dataTable", { searchable: true, fixedHeight: true });
  }
}

/* ---- Pipeline: construir gráficos desde parsedData + inputs ---- */
function buildVisuals(){
  if(!parsedData.length){
    setStatus('No hay datos cargados.', true);
    return;
  }

  // headerRow is global
  const guessed = guessColumns(headerRow);
  const colDate = qs('#col-date').value || guessed.date;
  const colValue = qs('#col-value').value || guessed.value;
  const colCategory = qs('#col-category').value || guessed.category;
  
  console.log('🔧 Columnas usadas - Fecha:', colDate, '| Valor:', colValue, '| Categoría:', colCategory);
  
  if(!colValue){
    setStatus('❌ Indica la columna de valores (columna numérica). Columnas disponibles: ' + headerRow.join(', '), true);
    return;
  }

  // Apply date filter if date column provided
  let working = parsedData.slice();
  if(colDate) working = applyDateRangeFilter(working, colDate);

  const chartType = qs('#chart-type').value;

  try {
    if((chartType === 'line' || chartType === 'bar') && colDate){
      const agg = aggregateByDate(working, colDate, colValue);
      updateMainChart(chartType, agg.labels, agg.values);

      if(colCategory){
        const aggCat = aggregateByCategory(working, colCategory, colValue);
        updateSecondaryChart(aggCat.labels.slice(0,6), aggCat.values.slice(0,6));
      } else {
        updateSecondaryChart(['Total'], [agg.values.reduce((a,b)=>a+b,0)]);
      }
    } else if(chartType === 'pie' && colCategory){
      const aggCat = aggregateByCategory(working, colCategory, colValue);
      updateMainChart('pie', aggCat.labels, aggCat.values);

      if(colDate){
        const agg = aggregateByDate(working, colDate, colValue);
        updateSecondaryChart(agg.labels.slice(-6), agg.values.slice(-6));
      } else {
        updateSecondaryChart(['Total'], [aggCat.values.reduce((a,b)=>a+b,0)]);
      }
    } else {
      // fallback: first N rows
      const labels = working.slice(0,20).map((r,i)=>r[headerRow[0]] || `r${i+1}`);
      const values = working.slice(0,20).map(r => parseFloat(Object.values(r)[1]) || 0);
      updateMainChart('bar', labels, values);
      updateSecondaryChart(['Total'], [values.reduce((a,b)=>a+b,0)]);
    }
    // Build table with currently filtered working rows
    rebuildTable(working, headerRow);

    const usedCols = `Fecha: ${colDate || 'N/A'}, Valor: ${colValue}, Categoría: ${colCategory || 'N/A'}`;
    setStatus(`✅ Gráficos actualizados (${working.length} filas). Columnas: ${usedCols}`);
  } catch (err){
    console.error(err);
    setStatus('Error construyendo visuales: ' + err.message, true);
  }
}

/* ---- CSV parsing handler ---- */
function handleParsed(results){
  if(results.errors && results.errors.length){
    setStatus('Error parseando CSV: ' + results.errors[0].message, true);
    return;
  }
  // PapaParse returns array of objects if header: true
  if(results.data && results.data.length){
    parsedData = results.data.map(r=>{
      // Normalize keys to strings
      const obj = {};
      Object.keys(r).forEach(k => obj[String(k).trim()] = r[k]);
      return obj;
    });
    headerRow = Object.keys(parsedData[0]);
    // Autodetect columns and fill inputs
    const detected = guessColumns(headerRow);
    fillDetectedColumns(detected);
    
    // Show detected columns to user
    const detectedInfo = [];
    if(detected.date) detectedInfo.push(`📅 Fecha: ${detected.date}`);
    if(detected.value) detectedInfo.push(`📊 Valor: ${detected.value}`);
    if(detected.category) detectedInfo.push(`🏷️ Categoría: ${detected.category}`);
    
    qs('#file-name').textContent = `${parsedData.length} filas cargadas. ${detectedInfo.length ? detectedInfo.join(' | ') : 'Columnas: ' + headerRow.join(', ')}`;
    
    buildVisuals();
  } else {
    setStatus('CSV vacío o mal formado.', true);
  }
}

/* ---- File loading functions ---- */
function loadCSVFromText(text){
  setStatus('Parseando CSV...');
  try{
    // Auto-detect delimiter (semicolon or comma)
    const firstLine = text.split('\n')[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';
    
    console.log('🔍 Delimitador detectado:', delimiter === ';' ? 'punto y coma (;)' : 'coma (,)');
    
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: delimiter,
      dynamicTyping: false, // Keep as strings to handle comma decimals
      transform: (value) => {
        // Convert comma decimals to dot decimals (e.g., "3,76" -> "3.76")
        if(typeof value === 'string' && value.match(/^\d+,\d+$/)){
          return value.replace(',', '.');
        }
        return value;
      },
      complete: handleParsed,
      error: (err) => setStatus('Error de parseo: ' + err.message, true)
    });
  } catch(err){
    setStatus('Excepción parseando CSV: ' + err.message, true);
  }
}
function loadFile(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e) => loadCSVFromText(e.target.result);
  reader.onerror = () => setStatus('No se pudo leer el archivo', true);
  reader.readAsText(file);
}

/* ---- Export functions ---- */
function downloadPNG(){
  if(!mainChart) { setStatus('El gráfico principal no está disponible aún.', true); return; }
  try{
    const a = document.createElement('a');
    a.href = mainChart.toBase64Image();
    a.download = 'chart.png';
    a.click();
    setStatus('PNG descargado.');
  } catch(err){
    setStatus('Error generando PNG: ' + err.message, true);
  }
}
function downloadCSV(){
  // Export the currently filtered rows (based on date range input)
  if(!parsedData.length){ setStatus('No hay datos para exportar.', true); return; }
  const guessed = guessColumns(headerRow);
  const colDate = qs('#col-date').value || guessed.date;
  let rows = parsedData.slice();
  if(colDate) rows = applyDateRangeFilter(rows, colDate);

  // Build CSV string
  const esc = v => `"${String(v ?? '').replace(/"/g,'""')}"`;
  const csv = [headerRow.map(esc).join(',')].concat(
    rows.map(r => headerRow.map(h => esc(r[h])).join(','))
  ).join('\n');

  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exported_data.csv';
  a.click();
  URL.revokeObjectURL(url);
  setStatus('CSV exportado.');
}

/* ---- UI wiring ---- */
function initUI(){
  const dropArea = qs('#drop-area');
  const fileInput = qs('#file-input');
  const btnSelect = qs('#btn-select');

  btnSelect.addEventListener('click', ()=>fileInput.click());
  fileInput.addEventListener('change', (e)=> { if(e.target.files.length) loadFile(e.target.files[0]); });

  ['dragenter','dragover'].forEach(ev => {
    dropArea.addEventListener(ev, e=>{ e.preventDefault(); dropArea.classList.add('dragover'); });
  });
  ['dragleave','drop'].forEach(ev => {
    dropArea.addEventListener(ev, e=>{ e.preventDefault(); dropArea.classList.remove('dragover'); });
  });
  dropArea.addEventListener('drop', e=>{
    const dt = e.dataTransfer;
    if(!dt || !dt.files || !dt.files.length) return;
    loadFile(dt.files[0]);
  });

  qs('#chart-type').addEventListener('change', buildVisuals);
  qs('#btn-apply-filter').addEventListener('click', buildVisuals);
  qs('#btn-download-png').addEventListener('click', downloadPNG);
  qs('#btn-download-csv').addEventListener('click', downloadCSV);
}

/* ---- Inicialización automática ---- */
document.addEventListener('DOMContentLoaded', ()=>{
  initUI();
  // Cargar CSV de ejemplo (para que la página muestre algo al abrir)
  loadCSVFromText(DEFAULT_CSV);
  setStatus('CSV de ejemplo cargado. Arrastra tu CSV para reemplazar y la app detectará columnas automáticamente.');
});
