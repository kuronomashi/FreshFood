import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
}

const alertStyles = {
  success: 'bg-emerald-50 border-emerald-500 text-emerald-800',
  error: 'bg-red-50 border-red-500 text-red-800',
  warning: 'bg-amber-50 border-amber-500 text-amber-800',
  info: 'bg-sky-50 border-sky-500 text-sky-800'
};

const iconStyles = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-sky-500'
};

const AlertIcon = ({ type }: { type: AlertType }) => {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };
  
  const Icon = icons[type];
  return <Icon className={`w-5 h-5 ${iconStyles[type]}`} />;
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose
}) => {
  return (
    <div className={`relative flex items-start p-4 mb-4 border-l-4 rounded-r-lg ${alertStyles[type]} animate-fadeIn`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <AlertIcon type={type} />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-1 text-sm opacity-90">{message}</div>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${iconStyles[type]} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};