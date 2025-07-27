import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Product from './pages/Product';
import Review from './pages/Review';
import Rating from './pages/Rating';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/products" element={<Product />} />
        <Route path="/reviews" element={<Review />} />
        <Route path="/ratings" element={<Rating />} />
      </Routes>
    </Router>
  );
}

export default App;
