import { useState } from 'react'
import logo from './assets/logo.svg'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./data/components/AuthPage";
import GamesPage from './data/components/Games';
import GameDetail from './data/components/GameDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage/>} />
        <Route path="/Games" element={<GamesPage/>} />
        <Route path="/games/:id" element={<GameDetail />} />
      </Routes>
    </Router>
  );
}

export default App;



