import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TextUpdaterProvider } from "./TextUpdaterContext"; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <TextUpdaterProvider> 
    <App />
  </TextUpdaterProvider>,
);

