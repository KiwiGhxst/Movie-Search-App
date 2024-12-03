import { Alert } from 'antd';
import './error-alert.css';
import React from 'react';

const OfflineMessage = () => (
  <div className="alert">
    <Alert message="У вас нет сети! Попробуйте подключиться заново)" type="error" />
  </div>
);

export default OfflineMessage;
