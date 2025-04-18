import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Blog from './components/Blog';
import Login from './components/Login';
import Signup from './components/Signup';
import CreatePost from './components/CreatePost';
import Posts from './components/Post';
import Chatbot from './components/Chatbot';
import React from 'react';

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

          {/* Create Post Page */}
          <Route path="/create-post" element={<CreatePost />} />

          {/* Posts List Page */}
          <Route path="/posts" element={<Posts />} />

          {/* Login and Signup Pages */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* chatbot page */}
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
