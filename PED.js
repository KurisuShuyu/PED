import React, { useState, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  AlertCircle, TrendingUp, TrendingDown, Filter, Zap, Target, UploadCloud, 
  FileJson, ChevronDown, AlertTriangle 
} from 'lucide-react';

// ==========================================
// 1. PANTALLA DE CARGA DE ARCHIVO
// ==========================================
const UploadScreen = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    setError(null);
    if (!file) return;
    
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setError("Por favor, sube un archivo JSON válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const datasets = Object.keys(json);
        if (datasets.length === 0) throw new Error("El JSON está vacío o no tiene el formato correcto.");
        onDataLoaded(json, datasets);
      } catch (err) {
        setError("Error al leer el archivo. Asegúrate de que es el metrics.json correcto.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <Zap size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Palvi Executive Report</h1>
        <p className="text-gray-500 mb-8">Sube tu archivo <span className="font-mono bg-gray-100 px-1 rounded text-sm">metrics.json</span> para generar el reporte al instante.</p>
        
        <div 
          className={`border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer relative ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-gray-100'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            processFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current.click()}
        >
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => processFile(e.target.files[0])}
          />
          <UploadCloud size={40} className={`mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-700">Arrastra tu archivo aquí</p>
          <p className="text-xs text-gray-500 mt-1">o haz clic para explorar en tu equipo</p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center justify-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. COMPONENTE SELECTOR DE MESES (CUSTOM)
// ==========================================
const MonthSelector = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.key === value) || options[0] || { label: 'Sin datos', isComplete: true };

  return (
    <div className="relative flex-1 sm:flex-none">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full sm:w-56 flex items-center justify-between p-2.5 rounded-lg border text-sm font-medium transition-colors ${
          !selected?.isComplete 
            ? 'bg-[#fef9c3] border-[#eab308] text-yellow-900' // Amarillo Mostaza suave para seleccionado
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span className="truncate flex items-center gap-2">
          {selected?.label} 
          {!selected?.isComplete && <AlertTriangle size={14} className="text-yellow-600" />}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop invisible para cerrar al hacer clic afuera */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
            <div className="p-1">
              <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">{label}</div>
              {options.length > 0 ? options.map(o => (
                <button
                  key={o.key}
                  onClick={() => { onChange(o.key); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                    !o.isComplete 
                      ? 'bg-[#eab308] text-yellow-950 font-semibold hover:bg-[#ca8a04] hover:text-white' // Amarillo Mostaza fuerte en lista
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span>{o.label}</span>
                  {!o.isComplete && <span className="text-[10px] uppercase tracking-wide opacity-80">Incompleto</span>}
                </button>
              )) : (
                <div className="px-3 py-2 text-sm text-gray-500">No hay meses disponibles</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};


// ==========================================
// 3. DASHBOARD PRINCIPAL
// ==========================================
export default function App() {
  const [rawData, setRawData] = useState(null);
  const [datasetsKeys, setDatasetsKeys] = useState([]);
  const [activeDataset, setActiveDataset] = useState('');
  
  const [monthA, setMonthA] = useState('');
  const [monthB, setMonthB] = useState('');
  const [chartMetric, setChartMetric] = useState('');

  // Cargar datos y extraer estructura
  const handleDataLoaded = (data, keys) => {
    setRawData(data);
    setDatasetsKeys(keys);
    setActiveDataset(keys[0]);
  };

  // Procesar los meses disponibles y su nivel de completitud
  const { availableMonths, metricsMeta } = useMemo(() => {
    if (!rawData || !activeDataset) return { availableMonths: [], metricsMeta: [] };
    
    const dataset = rawData[activeDataset];
    if (!dataset) return { availableMonths: [], metricsMeta: [] };

    // CORRECCIÓN: Búsqueda súper dinámica del array de datos (sin importar cómo se llame la llave)
    let dataArray = [];
    if (Array.isArray(dataset)) {
      dataArray = dataset;
    } else {
      // Busca cualquier valor que sea un array y que sus elementos tengan la propiedad 'date'
      const possibleArrays = Object.values(dataset).filter(val => Array.isArray(val));
      dataArray = possibleArrays.find(arr => arr.length > 0 && arr[0].date) || [];
      
      // Fallback estricto
      if (dataArray.length === 0) {
        dataArray = dataset.data || dataset.series || dataset.records || dataset.daily || [];
      }
    }

    const meta = dataset.metadata?.metrics || [];
    
    // Si no hay métricas definidas, intentar extraerlas del primer día
    let finalMeta = meta;
    if (finalMeta.length === 0 && dataArray.length > 0 && dataArray[0].metrics) {
      finalMeta = Object.keys(dataArray[0].metrics).map(k => ({
        key: k, label: k.replace(/_/g, ' '), unit: '', direction: 'higher_is_better'
      }));
    }

    // Agrupar por mes
    const monthsObj = {};
    dataArray.forEach(row => {
      if (!row || !row.date || typeof row.date !== 'string') return;
      const dateParts = row.date.split('T')[0].split('-'); // YYYY-MM-DD
      if (dateParts.length < 2) return;

      const yearMonth = `${dateParts[0]}-${dateParts[1]}`;
      
      if (!monthsObj[yearMonth]) {
        monthsObj[yearMonth] = { year: parseInt(dateParts[0], 10), month: parseInt(dateParts[1], 10), count: 0, rawData: [] };
      }
      monthsObj[yearMonth].count += 1;
      monthsObj[yearMonth].rawData.push(row);
    });

    // Calcular completitud y dar formato
    const monthsList = Object.keys(monthsObj).sort().map(key => {
      const group = monthsObj[key];
      // Días totales que tiene ese mes en particular
      const expectedDays = new Date(group.year, group.month, 0).getDate();
      
      // Construir nombre en español (Ej: "Abril 2025")
      const dateObj = new Date(group.year, group.month - 1, 1);
      let label = dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      label = label.charAt(0).toUpperCase() + label.slice(1);

      return {
        key,
        label,
        isComplete: group.count >= expectedDays, // Lógica de completitud
        count: group.count,
        expectedDays,
        data: group.rawData
      };
    });

    return { availableMonths: monthsList, metricsMeta: finalMeta };
  }, [rawData, activeDataset]);

  // Auto-seleccionar meses de forma segura usando useEffect
  React.useEffect(() => {
    if (availableMonths.length >= 2) {
      setMonthB(availableMonths[availableMonths.length - 1].key); // Último mes
      setMonthA(availableMonths[availableMonths.length - 2].key); // Penúltimo mes
    } else if (availableMonths.length === 1) {
      setMonthB(availableMonths[0].key);
      setMonthA(availableMonths[0].key);
    }
  }, [availableMonths]);

  // Auto-seleccionar métrica inicial para el gráfico
  React.useEffect(() => {
    if (metricsMeta.length > 0) {
      setChartMetric(prev => {
        if (!prev || !metricsMeta.find(m => m.key === prev)) {
          return metricsMeta[0].key;
        }
        return prev;
      });
    }
  }, [metricsMeta]);

  // Procesar KPIs y Datos del Gráfico
  const { kpis, chartData, insight } = useMemo(() => {
    if (!availableMonths.length || !monthA || !monthB) return { kpis: [], chartData: [], insight: "Cargando datos..." };

    const dataA = availableMonths.find(m => m.key === monthA)?.data || [];
    const dataB = availableMonths.find(m => m.key === monthB)?.data || [];
    const nameA = availableMonths.find(m => m.key === monthA)?.label || 'Mes A';
    const nameB = availableMonths.find(m => m.key === monthB)?.label || 'Mes B';

    const kpiResult = metricsMeta.map(m => {
      // Inferir si sumamos o promediamos en base a la unidad o nombre (si no viene en el JSON explícitamente)
      const isAvg = ['min', 'hrs', 'hours', 'days', '%'].includes(m.unit?.toLowerCase()) || 
                    m.key.includes('avg') || m.key.includes('time');

      let valA = 0, valB = 0;
      
      if (!isAvg) {
        valA = dataA.reduce((acc, curr) => acc + ((curr.metrics && curr.metrics[m.key]) || 0), 0);
        valB = dataB.reduce((acc, curr) => acc + ((curr.metrics && curr.metrics[m.key]) || 0), 0);
      } else {
        valA = dataA.length ? dataA.reduce((acc, curr) => acc + ((curr.metrics && curr.metrics[m.key]) || 0), 0) / dataA.length : 0;
        valB = dataB.length ? dataB.reduce((acc, curr) => acc + ((curr.metrics && curr.metrics[m.key]) || 0), 0) / dataB.length : 0;
      }

      const changePct = valA === 0 ? 0 : ((valB - valA) / valA) * 100;
      const isGood = m.direction === 'higher_is_better' ? changePct >= 0 : changePct <= 0;

      return {
        ...m,
        valA: !isAvg ? Math.round(valA) : valA.toFixed(1),
        valB: !isAvg ? Math.round(valB) : valB.toFixed(1),
        changePct: changePct.toFixed(1),
        isGood
      };
    });

    // Encontrar la métrica más preocupante para la alerta
    const worstMetric = [...kpiResult].sort((a, b) => {
      const aBadness = a.isGood ? 0 : Math.abs(parseFloat(a.changePct));
      const bBadness = b.isGood ? 0 : Math.abs(parseFloat(b.changePct));
      return bBadness - aBadness;
    })[0];

    let focusMessage = "Las tendencias generales se ven saludables en este periodo.";
    if (worstMetric && !worstMetric.isGood && Math.abs(parseFloat(worstMetric.changePct)) > 5) {
      const verb = worstMetric.direction === 'higher_is_better' ? 'cayó' : 'aumentó (negativo)';
      focusMessage = `Alerta ejecutiva: "${worstMetric.label}" ${verb} un ${Math.abs(worstMetric.changePct)}% respecto al mes anterior. Requiere revisión de equipo.`;
    }

    // Datos del gráfico (Eje X del 1 al 31)
    const cData = [];
    for (let i = 1; i <= 31; i++) {
      // Buscar si el día existe en los datos
      const dayA = dataA.find(d => d.date && parseInt(d.date.split('T')[0].split('-')[2], 10) === i);
      const dayB = dataB.find(d => d.date && parseInt(d.date.split('T')[0].split('-')[2], 10) === i);
      
      cData.push({
        day: i,
        [nameA]: dayA && dayA.metrics ? dayA.metrics[chartMetric] : null,
        [nameB]: dayB && dayB.metrics ? dayB.metrics[chartMetric] : null,
      });
    }

    return { kpis: kpiResult, chartData: cData, insight: focusMessage };
  }, [availableMonths, monthA, monthB, chartMetric, metricsMeta]);

  // Si no hay datos, mostrar carga
  if (!rawData) return <UploadScreen onDataLoaded={handleDataLoaded} />;

  // Render principal del Dashboard
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
      
      {/* HEADER & DATASET SELECTOR DINÁMICO */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-blue-600" />
            Palvi Executive Report
          </h1>
          <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <FileJson size={14} /> Archivo cargado correctamente
            <button onClick={() => setRawData(null)} className="text-blue-600 hover:underline ml-2">Subir otro</button>
          </div>
        </div>
        
        {/* Adaptable a cualquier cantidad de Datasets (A, B, C, D, E...) */}
        <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex items-center overflow-x-auto max-w-full">
          <span className="text-xs text-gray-500 px-3 uppercase font-bold tracking-wider">Escenario:</span>
          <div className="flex gap-1">
            {datasetsKeys.map(ds => (
              <button
                key={ds}
                onClick={() => setActiveDataset(ds)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeDataset === ds 
                    ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {ds}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CONTROLES DE FECHA (MESES DINÁMICOS Y COMPLETITUD) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center">
        <div className="flex items-center gap-2 text-gray-700 font-bold whitespace-nowrap">
          <Filter size={20} className="text-blue-600" />
          Análisis de Periodos:
        </div>
        
        <div className="flex flex-col sm:flex-row w-full gap-3 items-center">
          <MonthSelector 
            label="Mes de Referencia (A)"
            value={monthA} 
            options={availableMonths} 
            onChange={setMonthA} 
          />
          <span className="text-gray-400 font-bold text-sm bg-gray-100 px-3 py-1 rounded-full">VS</span>
          <MonthSelector 
            label="Mes a Evaluar (B)"
            value={monthB} 
            options={availableMonths} 
            onChange={setMonthB} 
          />
        </div>
      </div>

      {/* SECCIÓN DE FOCO (INSIGHT) */}
      <div className={`mb-8 p-5 rounded-2xl border-2 flex items-start gap-4 transition-colors ${
        insight.includes('Alerta ejecutiva') 
          ? 'bg-red-50 border-red-200 text-red-900' 
          : 'bg-green-50 border-green-200 text-green-900'
      }`}>
        <div className="mt-0.5">
          {insight.includes('Alerta') ? <AlertCircle size={28} className="text-red-600" /> : <Target size={28} className="text-green-600" />}
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1">Foco del Día</h3>
          <p className="text-base md:text-lg opacity-90 leading-snug">{insight}</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.key} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all group">
            <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-4">{kpi.label}</h4>
            
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-black text-gray-900 tracking-tight">
                  {kpi.valB} <span className="text-base font-medium text-gray-400">{kpi.unit}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1 truncate max-w-[120px]">
                  {availableMonths.find(m => m.key === monthB)?.label}
                </div>
              </div>

              <div className="text-right">
                <div className={`flex items-center justify-end gap-1 font-black text-lg ${
                  kpi.isGood ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.changePct > 0 ? <TrendingUp size={20} strokeWidth={3} /> : <TrendingDown size={20} strokeWidth={3} />}
                  {Math.abs(kpi.changePct)}%
                </div>
                <div className="text-sm text-gray-400 mt-1 truncate max-w-[120px]">
                  vs {kpi.valA} ({availableMonths.find(m => m.key === monthA)?.label})
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GRÁFICO SUPERPUESTO */}
      <div className="bg-white p-5 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tendencia Diaria Comparativa</h3>
            <p className="text-sm text-gray-500">Día 1 al 31 del mes</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50 p-2 rounded-lg border border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase px-2">Métrica:</span>
            <select 
              value={chartMetric} 
              onChange={(e) => setChartMetric(e.target.value)}
              className="text-sm font-semibold text-blue-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none truncate max-w-[150px] sm:max-w-[200px]"
            >
              {metricsMeta.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(val) => `Día ${val}`}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(val) => `Día ${val} del mes`}
                labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 500, paddingTop: '20px' }} />
              
              <Line 
                type="monotone" 
                name={availableMonths.find(m => m.key === monthA)?.label || 'Mes A'}
                dataKey={availableMonths.find(m => m.key === monthA)?.label} 
                stroke="#9ca3af" // Gris para mes de referencia
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                name={availableMonths.find(m => m.key === monthB)?.label || 'Mes B'}
                dataKey={availableMonths.find(m => m.key === monthB)?.label} 
                stroke="#2563eb" // Azul vibrante para mes actual
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 7, strokeWidth: 0, fill: '#1d4ed8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
