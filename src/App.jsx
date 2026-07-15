import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Testing from './pages/Testing';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Testing />} />
        <Route path="/testing" element={<Testing />} />
      </Routes>
    </Router>
  );
};

export default App;
