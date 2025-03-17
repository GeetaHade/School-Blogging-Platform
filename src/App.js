import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Blog from './components/Blog';
import Login from './components/Login';
import Signup from './components/Signup';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Blog Page */}
          <Route path="/" element={<Blog />} />
          
          {/* Individual Topic Pages */}
          <Route path="/academic-resources" element={<div>Academic Resources Page</div>} />
          <Route path="/career-services" element={<div>Career Services Page</div>} />
          <Route path="/campus" element={<div>Campus Page</div>} />
          <Route path="/culture" element={<div>Culture Page</div>} />
          <Route path="/local-community" element={<div>Local Community Resources Page</div>} />
          <Route path="/social" element={<div>Social Page</div>} />
          <Route path="/sports" element={<div>Sports Page</div>} />
          <Route path="/health" element={<div>Health and Wellness Page</div>} />
          <Route path="/technology" element={<div>Technology Page</div>} />
          <Route path="/travel" element={<div>Travel Page</div>} />
          <Route path="/alumni" element={<div>Alumni Page</div>} />

          {/* Login Page */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
