import { useState } from 'react';
import AnimatedBox from './components/AnimatedBox.jsx';
import Navbar from './components/Navbar.jsx';

function App() {

  return (
    <div className="relative  bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 bg-[length:200%_200%] animate-gradient-move min-h-screen h-full">
      <Navbar />
      <AnimatedBox />
      
    </div>
  );
}

export default App;
