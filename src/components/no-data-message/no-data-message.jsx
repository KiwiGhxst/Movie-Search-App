import { Alert } from 'antd';
import './no-data-message.css';
import React from 'react';

const NoDataMessage = () => (
  <div className="alert">
    <Alert message="Ничего не найдено(" type="error" />
  </div>
);

export default NoDataMessage;
