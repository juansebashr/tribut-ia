import React from 'react';
import { useApp } from '../../context/AppContext';

export const ConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirmModal } = useApp();

  if (!confirmModal) return null;

  const { title, msg, icon = '⚠️', confirmText = 'Aceptar', onConfirm } = confirmModal;

  const handleAccept = () => {
    closeConfirmModal();
    onConfirm();
  };

  return (
    <div
      id="modal-confirm-action"
      className="modal-backdrop"
      style={{ display: 'flex' }}
      onClick={closeConfirmModal}
    >
      <div
        className="modal-content"
        style={{ maxWidth: '480px', textAlign: 'center', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div id="confirm-modal-icon" style={{ fontSize: '38px', marginBottom: '12px' }}>
          {icon}
        </div>
        <h3
          id="confirm-modal-title"
          style={{ fontSize: '16px', fontWeight: 800, color: '#0b3b60', margin: '0 0 8px 0' }}
        >
          {title}
        </h3>
        <p
          id="confirm-modal-msg"
          style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 20px 0' }}
        >
          {msg}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifySelf: 'center', justifyContent: 'center' }}>
          <button className="btn btn-outline" style={{ minWidth: '110px' }} onClick={closeConfirmModal}>
            Cancelar
          </button>
          <button
            id="confirm-modal-btn-accept"
            className="btn btn-primary"
            style={{ background: '#e11d48', borderColor: '#be123c', minWidth: '130px' }}
            onClick={handleAccept}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
