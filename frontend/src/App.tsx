import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/user-login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
