import { useState } from 'react';
import Building from './buildinggen/building';
import Blueprint from './components/blueprint';
import BuildingGeo from './components/buildingGeo';
import './App.css';


function App() {
  const [ building ] = useState(new Building());

  return (
    <div className="App">
      <BuildingGeo
        building={building}
      />
      
      <Blueprint 
        building={building}
      />

    </div>
  );
}

export default App;
