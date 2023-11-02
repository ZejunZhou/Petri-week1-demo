import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TextUpdaterProvider } from './Node-type/TextUpdaterContext'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
import ConfigData from './ConfigData';
import { BrowserRouter as Router} from "react-router-dom";

const GOOGLE_CLIENT_ID = ConfigData.CLIENT_ID;

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Router>
    <TextUpdaterProvider> 
        <App />
    </TextUpdaterProvider>
    </Router>
  </GoogleOAuthProvider>
);

