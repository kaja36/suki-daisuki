import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/index'; // 
import VideoPlayer from './pages/VideoPlayer/index'; 
import SegmentDemo from './pages/SegmentDemo';
import ThrowDemo from './pages/ThrowDemo';
import FaceDemo from './pages/FaceDemo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video/:id" element={<VideoPlayer />} />
        <Route path="/demo/faceDemo" element={<FaceDemo />} />
        <Route path="/demo/throwDemo" element={<ThrowDemo />} />
        <Route path="/demo/segmentDemo" element={<SegmentDemo/>} />
      </Routes>
    </Router>
  );
}

export default App;