import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

interface UvtConverterWidgetProps {
  taxYear: number;
  uvtValue: number;
}

export const UvtConverterWidget: React.FC<UvtConverterWidgetProps> = ({ taxYear, uvtValue }) => {
  const [copAmount, setCopAmount] = useState<string>('50000000');
  const [uvtAmount, setUvtAmount] = useState<string>('');

  const handleCopChange = async (val: string) => {
    setCopAmount(val);
    const num = parseFloat(val) || 0;
    if (uvtValue > 0) {
      setUvtAmount((num / uvtValue).toFixed(2));
    }
  };

  const handleUvtChange = async (val: string) => {
    setUvtAmount(val);
    const num = parseFloat(val) || 0;
    if (uvtValue > 0) {
      setCopAmount(Math.round(num * uvtValue).toString());
    }
  };

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div className="card-title">
          <ArrowRightLeft size={17} color="#1e3a8a" />
          Conversor Rápido Pesos (COP) ⇄ UVT ({taxYear})
        </div>
        <span className="badge-uvt">1 UVT = ${uvtValue.toLocaleString('es-CO')} COP</span>
      </div>
      <div className="card-body">
        <div className="inputs-row" style={{ alignItems: 'flex-end' }}>
          <div className="input-field">
            <label className="input-label">Monto en Pesos Colombianos (COP)</label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="number"
                className="number-input"
                value={copAmount}
                onChange={(e) => handleCopChange(e.target.value)}
                placeholder="Ej. 50.000.000"
              />
            </div>
          </div>

          <div className="input-field">
            <label className="input-label">Equivalente en UVT</label>
            <div className="input-wrapper">
              <span className="input-prefix">UVT</span>
              <input
                type="number"
                className="number-input"
                style={{ paddingLeft: '42px' }}
                value={uvtAmount || (parseFloat(copAmount) / uvtValue).toFixed(2)}
                onChange={(e) => handleUvtChange(e.target.value)}
                placeholder="Ej. 1000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
