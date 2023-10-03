import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { HomePage } from "../pages";
import { AuthProvider } from "./firebase/auth/auth-context";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
