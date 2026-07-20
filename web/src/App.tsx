import { NavLink, Route, Routes } from 'react-router-dom';
import { BreedingPlanPage } from './pages/BreedingPlanPage';
import { PairCalculatorPage } from './pages/PairCalculatorPage';
import { PalsPage } from './pages/PalsPage';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="brand">
            <span className="brand-mark">🥚</span>
            Palworld Breeding Planner
          </span>
          <nav>
            <NavLink to="/breeding-plan" className={({ isActive }) => (isActive ? 'active' : '')}>
              Breeding Plan
            </NavLink>
            <NavLink to="/pair-calculator" className={({ isActive }) => (isActive ? 'active' : '')}>
              Pair Calculator
            </NavLink>
            <NavLink to="/pals" className={({ isActive }) => (isActive ? 'active' : '')}>
              Pals
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<BreedingPlanPage />} />
          <Route path="/breeding-plan" element={<BreedingPlanPage />} />
          <Route path="/pair-calculator" element={<PairCalculatorPage />} />
          <Route path="/pals" element={<PalsPage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        Breeding data derived from datamined Palworld game files. Not affiliated with Pocketpair.
      </footer>
    </div>
  );
}

export default App;
