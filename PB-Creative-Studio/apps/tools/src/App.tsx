import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CompoundInterest from './pages/CompoundInterest';
import SIPCalculator from './pages/SIPCalculator';
import PropFirm from './pages/PropFirm';

function App() {
  return (
    <BrowserRouter basename="/tool">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="compound-interest-calculator" element={<CompoundInterest />} />
          <Route path="compound-interest" element={<CompoundInterest />} />
          <Route path="sip-calculator" element={<SIPCalculator />} />
          <Route path="prop-firm" element={<PropFirm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
