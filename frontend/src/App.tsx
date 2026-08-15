import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UvtConverterWidget } from './components/UvtConverterWidget';
import { PersonaNaturalCalculator } from './components/PersonaNaturalCalculator';
import { PersonaJuridicaCalculator } from './components/PersonaJuridicaCalculator';
import { RulesInspector } from './components/RulesInspector';
import { AgentToolkitDocs } from './components/AgentToolkitDocs';
import { fetchAvailableYears, fetchRulesForYear } from './services/api';
import { Calendar, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pn' | 'pj' | 'rules' | 'docs'>('pn');
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2025, 2024, 2022]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [currentUvt, setCurrentUvt] = useState<number>(52350);
  const [customUvtInput, setCustomUvtInput] = useState<string>('52350');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const years = await fetchAvailableYears();
      if (years && years.length > 0) {
        setAvailableYears(years);
        const defaultYear = years[0];
        setSelectedYear(defaultYear);
        const rules = await fetchRulesForYear(defaultYear);
        setCurrentUvt(rules.uvt_value);
        setCustomUvtInput(rules.uvt_value.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    try {
      const rules = await fetchRulesForYear(year);
      setCurrentUvt(rules.uvt_value);
      setCustomUvtInput(rules.uvt_value.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const handleUvtBlur = () => {
    const val = parseFloat(customUvtInput);
    if (val && val > 0) {
      setCurrentUvt(val);
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {/* HEADER CONTROLS BAR */}
        <div className="header-bar">
          <div className="header-meta">
            <div className="selector-group">
              <Calendar size={16} color="var(--primary)" />
              <label>Año Fiscal:</label>
              <select
                className="select-input"
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Año Gravable {yr} {yr === 2026 ? '(Vigente)' : yr === 2022 ? '(Excel Base)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="selector-group">
              <Layers size={16} color="var(--primary)" />
              <label>Valor UVT:</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>$</span>
                <input
                  type="number"
                  className="text-input"
                  style={{ paddingLeft: '24px', width: '130px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  value={customUvtInput}
                  onChange={(e) => setCustomUvtInput(e.target.value)}
                  onBlur={handleUvtBlur}
                  title="Puedes modificar el valor de la UVT para simular reformas o decretos"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge-uvt">Estatuto Tributario Col. Actualizado</span>
          </div>
        </div>

        {/* WIDGET UVT CONVERTER */}
        <UvtConverterWidget taxYear={selectedYear} uvtValue={currentUvt} />

        {/* ACTIVE VIEW TAB */}
        {activeTab === 'pn' && (
          <PersonaNaturalCalculator taxYear={selectedYear} uvtValue={currentUvt} />
        )}

        {activeTab === 'pj' && (
          <PersonaJuridicaCalculator taxYear={selectedYear} uvtValue={currentUvt} />
        )}

        {activeTab === 'rules' && (
          <RulesInspector taxYear={selectedYear} uvtValue={currentUvt} />
        )}

        {activeTab === 'docs' && <AgentToolkitDocs />}
      </main>
    </div>
  );
};

export default App;
