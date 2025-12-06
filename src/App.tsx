import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/index'; // 
import VideoPlayer from './pages/VideoPlayer/index'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video/:id" element={<VideoPlayer />} />
      </Routes>
    </Router>
  );
}

export default App;