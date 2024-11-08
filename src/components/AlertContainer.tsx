import React from 'react';
import { Alert, AlertType } from './Alert';

interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  message: string;
}

interface AlertContainerProps {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({
  alerts,
  onDismiss,
  
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-md space-y-4">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => onDismiss(alert.id)}
        />
      ))}
    </div>
  );
};