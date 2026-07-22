import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthGate from './components/AuthGate/AuthGate';
import Dashboard from './pages/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions';
import Categories from './pages/Categories/Categories';
import { CategoriesProvider } from './context/CategoriesContext';

// Lazy: Insights pulls in recharts (~500kB), only loads when visited
const Insights = lazy(() => import('./pages/Insights/Insights'));

const App = () => {

  return (
    <BrowserRouter>
      <AuthGate>
        <CategoriesProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path='/' element={<Dashboard/>}></Route>
              <Route path='/categories' element={<Categories/>}></Route>
              <Route path='/transactions' element={<Transactions/>}></Route>
              <Route path='/insights' element={<Insights/>}></Route>
            </Routes>
          </Suspense>
        </CategoriesProvider>
      </AuthGate>
    </BrowserRouter>
  )
}

export default App;
