import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGate from './components/AuthGate/AuthGate';
import Dashboard from './pages/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions';
import Categories from './pages/Categories/Categories';
import Insights from './pages/Insights/Insights';
import { CategoriesProvider } from './context/CategoriesContext';

const App = () => {

  return (
    <BrowserRouter>
      <AuthGate>
        <CategoriesProvider>
          <Routes>
            <Route path='/' element={<Dashboard/>}></Route>
            <Route path='/categories' element={<Categories/>}></Route>
            <Route path='/transactions' element={<Transactions/>}></Route>
            <Route path='/insights' element={<Insights/>}></Route>
          </Routes>
        </CategoriesProvider>
      </AuthGate>
    </BrowserRouter>
  )
}

export default App;
