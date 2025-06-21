/*import logo from './logo.svg';*/
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MarketplacePage from './pages/MarketplacePage';
import DonationsPage from './pages/DonationsPage';
import LostFoundPage from './pages/LostFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RentPage from './pages/RentPage';
import TradePage from './pages/TradePage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/donations" element={<DonationsPage />}/>
        <Route path="/lost-found" element={<LostFoundPage/>}/>
        <Route path="/forgotpassword" element={<ForgotPasswordPage/>}/>
        <Route path="/rent" element={<RentPage/>}/>
        <Route path="/trade" element={<TradePage/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
