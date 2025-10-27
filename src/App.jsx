import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; 
import Home from "./pages/Home.jsx";
import AdminLoginPage from "./components/AdminLoginPage.jsx";
import RecipeDetails from "./components/RecipeDetails";
import RecipeForm from "./components/RecipeForm.jsx";
import RecipeList from "./components/RecipeList.jsx";
import UserRecipes from "./pages/UserRecipes.jsx";
import EditRecipe from "./pages/EditRecipe.jsx";
import AdminPanel from "./Admin/AdminPanel.jsx";
import UserDashboard from "./User/UserDashboard.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import ErrorBoundary from "./ErrorBoundary.jsx";
import RejectedRecipes from "./User/RejectedRecipes.jsx";
import Login from "./pages/Login.jsx";
import ResetPassword from "./Reset/ResetPassword.jsx";
import UserDetails from "./User/UserDetails.jsx";

const isAdminAuthenticated = () => {
  return !!localStorage.getItem('adminToken'); 
};
const isUserAuthenticated = ()=>{
  return !!localStorage.getItem('token');
}

const AdminProtectedRoute = ({ children }) => {
  return isAdminAuthenticated() ? children : <Navigate to="/admin-login" />; 
};
const UserProtectedRoute=({children})=>{
  return isUserAuthenticated()? children : <Navigate to="/"/>;
}

const App = () => {
  const [isLoginPage, setIsLoginPage] = useState(false);

  useEffect(() => {
    const currentPath = window.location.pathname;
    setIsLoginPage(
   currentPath === "/login" || currentPath === "/signup" || currentPath === "/admin-login" 
    );
  }, [window.location.pathname]);

  return (
    <div className={isLoginPage ? "home-container blur" : "home-container"}>
      <ToastContainer position="top-right" autoClose={3000} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/recipe-details/:recipeId" element={<UserProtectedRoute><RecipeDetails /></UserProtectedRoute>} />
          <Route path="/recipelist" element={<UserProtectedRoute><RecipeList /></UserProtectedRoute>} />
          <Route path="/add-recipe" element={<UserProtectedRoute><RecipeForm /></UserProtectedRoute>} />
          <Route path="/my-recipes" element={<UserProtectedRoute><UserRecipes /></UserProtectedRoute>} />
          <Route path="/edit-recipe/:id" element={<UserProtectedRoute><EditRecipe /></UserProtectedRoute>} />
          <Route path="/admin-panel" element={<AdminProtectedRoute><AdminPanel /></AdminProtectedRoute>} /> 
          <Route path="/admin/user/:userId" element={<AdminProtectedRoute><UserDetails /></AdminProtectedRoute>} /> 
          <Route path="/user-dashboard" element={<UserProtectedRoute><UserDashboard /></UserProtectedRoute>} />
          <Route path="/rejected-recipes" element={<UserProtectedRoute><RejectedRecipes /></UserProtectedRoute>} />
          <Route path="/reset" element={<ResetPassword />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;
