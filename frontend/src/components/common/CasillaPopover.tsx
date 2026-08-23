import React from 'react';
import { useApp } from '../../context/AppContext';

export const CasillaPopover: React.FC = () => {
  const { popoverState, hideCasillaPopover, togglePinPopover } = useApp();

  if (!popoverState.visible || !popoverState.info) return null;

  const { casillaNum, info, position, isPinned } = popoverState;

  return (
    <div
      id="casilla-popover"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        display: 'block',
        zIndex: 9999,
      }}
      className={isPinned ? 'pinned' : ''}
    >
      <div className="popover-header">
        <div>
          <span className="popover-badge-num" id="popover-num">
            Casilla {casillaNum}
          </span>
          <div className="popover-title-text" id="popover-title" style={{ marginTop: '4px' }}>
            {info.titulo}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="popover-close-btn"
            onClick={togglePinPopover}
            title={isPinned ? 'Desanclar' : 'Anclar popover'}
            style={{ fontSize: '11px' }}
          >
            {isPinned ? '📌' : '📍'}
          </button>
          <button className="popover-close-btn" onClick={hideCasillaPopover} title="Cerrar">
            ✕
          </button>
        </div>
      </div>

      <div className="popover-art-tag" id="popover-art">
        {info.art}
      </div>

      <div className="popover-section">
        <div className="popover-section-label">📌 ¿A qué hace referencia?</div>
        <div className="popover-section-body" id="popover-concepto">
          {info.concepto}
        </div>
      </div>

      <div className="popover-section">
        <div className="popover-section-label">✍️ ¿Cómo debería llenarse?</div>
        <div className="popover-section-body instruccion" id="popover-como-llenar">
          {info.como_llenar}
        </div>
      </div>

      {info.tope && (
        <div className="popover-section" id="popover-section-tope">
          <div className="popover-section-label">⚠️ Tope / Validación Legal</div>
          <div className="popover-section-body tope-legal" id="popover-tope">
            {info.tope}
          </div>
        </div>
      )}
    </div>
  );
};
