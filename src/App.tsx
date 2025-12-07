import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/index'; // 
import VideoPlayer from './pages/VideoPlayer/index'; 
import SegmentDemo from './pages/Demo/SegmentDemo';
import ThrowDemo from './pages/Demo/ThrowDemo';
import FaceDemo from './pages/Demo/FaceDemo';
import Demo from './pages/Demo/Demo';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video/:id" element={<VideoPlayer />} />
        
        {/* デモ用 削除予定*/}
        <Route path="/demo" element={<Demo />} />
        <Route path="/demo/faceDemo" element={<FaceDemo />} />
        <Route path="/demo/throwDemo" element={<ThrowDemo />} />
        <Route path="/demo/segmentDemo" element={<SegmentDemo/>} />
      </Routes>
    </Router>
  );
}

export default App;