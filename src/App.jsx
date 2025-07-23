import { useState } from 'react'
import logo from './assets/logo.svg'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./data/components/Login";
import Games from './data/components/Games';
import GameDetail from './data/components/GameDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Games" element={<Games/>} />
        <Route path="/games/:id" element={<GameDetail />} />
      </Routes>
    </Router>
  );
}

export default App;



