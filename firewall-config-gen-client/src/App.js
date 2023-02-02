import './App.css';
import { render } from '@testing-library/react';


export function RenderHeader(){
  return (
    <div className='header'>
      <h1> Fortigate Firewall Config Gen</h1>
    </div>
  );
}

function renderBody(){
  return(
    <div className='newbodywhodis'>
      <p> This is a body</p>
      <p> This is another body </p>
    </div>
  );
}

function App() {
  // needs to have a header, body and sidebar
  return (
    renderBody()
  );
}

export default App;
