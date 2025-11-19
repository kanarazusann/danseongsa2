import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Order from './pages/Order';
import Payment from './pages/Payment';
import OrderDetail from './pages/OrderDetail';
import RefundRequest from './pages/RefundRequest';
import LoginForm from './pages/LoginForm';
import Signup from './pages/Signup';
import FindId from './pages/FindId';
import FindPassword from './pages/FindPassword';
import ResetPassword from './pages/ResetPassword';
import MyPage from './pages/MyPage';
import EditProfile from './pages/EditProfile';
import EditSellerProfile from './pages/EditSellerProfile';
import ChangePassword from './pages/ChangePassword';
import SellerDashboard from './pages/SellerDashboard';
import SellerPage from './pages/SellerPage';
import ReviewWrite from './pages/ReviewWrite';
import ProductRegister from './pages/ProductRegister';
import ProductEdit from './pages/ProductEdit';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<Order />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/refund/request" element={<RefundRequest />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/find-id" element={<FindId />} />
          <Route path="/find-password" element={<FindPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/EditProfile" element={<EditProfile />} />
          <Route path="/edit-seller-profile" element={<EditSellerProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/sellerDashboard" element={<SellerDashboard />} />
          <Route path="/seller" element={<SellerPage />} />
          <Route path="/review/write" element={<ReviewWrite />} />
          <Route path="/product/register" element={<ProductRegister />} />
          <Route path="/product/edit/:id" element={<ProductEdit />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;