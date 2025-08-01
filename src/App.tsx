import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Board from './routes/Board';
import Discover from './routes/Discover';
import Search from './routes/Search';
import MetaDetails from './routes/MetaDetails';
import Player from './routes/Player';
import StremioPlayer from './routes/StremioPlayer';
import Settings from './routes/Settings';
import './App.less';

const App = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="app">
        <Routes>
          <Route path="/" element={<Board />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/discover/:type" element={<Discover />} />
          <Route path="/discover/:type/:catalog" element={<Discover />} />
          <Route path="/search" element={<Search />} />
          <Route path="/detail/:type/:id" element={<MetaDetails />} />
          <Route path="/watch/:id" element={<StremioPlayer />} />
          <Route path="/watch-basic/:id" element={<Player />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;