import React from 'react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  return (
    <div
      id="fiscol-toast-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const bgColor =
          toast.type === 'success'
            ? '#065f46'
            : toast.type === 'warning'
            ? '#9a3412'
            : toast.type === 'error'
            ? '#991b1b'
            : '#1e3a8a';
        const icon =
          toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠️' : toast.type === 'error' ? '✕' : 'ℹ️';

        return (
          <div
            key={toast.id}
            style={{
              background: bgColor,
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              pointerEvents: 'auto',
              borderLeft: '4px solid #38bdf8',
              maxWidth: '420px',
              animation: 'toastSlideIn 0.3s ease forwards',
            }}
          >
            <span style={{ fontSize: '16px' }}>{icon}</span>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
