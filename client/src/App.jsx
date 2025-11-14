import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./data/components/AuthPage";
import GamesPage from './data/components/Games';
import GameDetail from './data/components/GameDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage/>} />
        <Route 
          path="/games" 
          element={
            <ProtectedRoute>
              <GamesPage/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/games/:id" 
          element={
            <ProtectedRoute>
              <GameDetail />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
