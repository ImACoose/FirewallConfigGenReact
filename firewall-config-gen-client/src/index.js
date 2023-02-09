import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import FireWallDetailsForm from './Components/FormBody';
import {RenderHeader} from './App';
import CreateContainer from './Components/Container';
// each react document has a root. the file with the root is the main document
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RenderHeader/>
    <FireWallDetailsForm>
    </FireWallDetailsForm>
  </React.StrictMode>
);

