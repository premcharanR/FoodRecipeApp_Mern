import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import "./Home.css";
import axios from "axios";

axios
  .get("http://localhost:5000/api/recipes", { status: "approved" })
  .then((res) => console.log(res.data))
  .catch((err) => console.error(err));


const Home = () => {
  const [theme, setTheme] = useState("light");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [blurHome, setBlurHome] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRatings, setUserRatings] = useState({});


  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem("token");


    const fetchRecipes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/recipes");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched recipes:", data);
        if (data.length === 0) {
          setError("No approved recipes found.");
        } else {
          setRecipes(data);
        }
      } catch (err) {
        setError(`Error fetching recipes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  const handleLoginSuccess = (token, userId) => {
    setIsLoggedIn(true);
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("isLoggedIn", "true");
    closeLogin();
  };


  const handleReadMoreClick = (recipe) => {
    if (isLoggedIn) {
      navigate(`/recipe-details/${recipe._id}`);
    } else {
      setShowLogin(true);
      setBlurHome(true);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", { method: "POST" });
      if (response.ok) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        setIsLoggedIn(false);
        navigate("/");
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [navigate]);

  const closeLogin = useCallback(() => {
    setShowLogin(false);
    setBlurHome(false);
  }, []);

  const handleSignupClick = useCallback(() => {
    setShowSignup(true);
    setBlurHome(true);
  }, []);

  const closeSignup = useCallback(() => {
    setShowSignup(false);
    setBlurHome(false);
  }, []);
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleRatingChange = (recipeId, rating) => {
    setUserRatings((prevRatings) => ({
      ...prevRatings,
      [recipeId]: rating,
    }));
  };
  const submitRating = async (recipeId) => {
    if (!isLoggedIn) {
      alert("❌ Please log in to rate recipes.");
      return;
    }

    const token = localStorage.getItem("token");
    const rating = userRatings[recipeId];

    if (!rating) {
      alert("❌ Please select a rating before submitting.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/recipes/${recipeId}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert("✅ Rating submitted successfully!");
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe._id === recipeId ? { ...recipe, averageRating: response.data.averageRating } : recipe
          )
        );


        setUserRatings((prevRatings) => ({
          ...prevRatings,
          [recipeId]: "rated",
        }));
      }
    } catch (error) {
      console.error("❌ Error submitting rating:", error);
      if (error.response?.status === 400) {
        alert("⚠️ You have already rated this recipe!");
        setUserRatings((prevRatings) => ({
          ...prevRatings,
          [recipeId]: "rated",
        }));
      } else {
        alert("❌ Failed to submit rating. Please try again.");
      }
    }
  };


  return (
    <div className={`home-container ${theme}`}>
      <header className="header-bar">
        <div className="app-name">Delight Food Recipes</div>
        <div className="header-right">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for a recipe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          {!isLoggedIn ? (
            <>
              <button className="login-btn" onClick={() => setShowLogin(true)}>Login</button>
              <button className="login-btn" onClick={handleSignupClick}>SignUp</button>
            </>
          ) : (
            <>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
              <button className="add-recipe-btn" onClick={() => navigate("/add-recipe")}>➕ Add Recipe</button>
              <button className="dashboard-btn" onClick={() => navigate("/user-dashboard")}>📊 User Dashboard</button>
            </>
          )}
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      <main className={`home-content ${blurHome ? "blur" : ""}`}>
        <div className="recipe-gallery" style={{ marginTop: "100px" }}>
          {loading ? (
            <p>Loading recipes...</p>
          ) : error ? (
            <p style={{ color: "red" }}>Error: {error}</p>
          ) : filteredRecipes.length === 0 ? (
            <p>No recipes found.</p>
          ) : (
            filteredRecipes.map((recipe) => (
              <article className="recipe-card" key={recipe._id}>
                <div className="image-container">
                  <img
                    src={`http://localhost:5000/${recipe.image.startsWith('uploads/') ? '' : 'uploads/'}${recipe.image}?timestamp=${new Date().getTime()}`}
                    alt={recipe.title || "Recipe Image"}
                    className="recipe-img-shape"
                    onError={(e) => (e.target.src = "/fallback-image.jpg")}
                  />
                </div>
                <div className="recipe-info">
                  <h3>{recipe.title}</h3>
                  <p>{recipe.description}</p>
                  <button className="read-more-btn" onClick={() => handleReadMoreClick(recipe)}>
                    Read More
                  </button>
                  <p>⭐ Average Rating: {recipe.averageRating ? recipe.averageRating.toFixed(1) : "Not rated yet"}</p>

                  <select
                    value={userRatings[recipe._id] || ""}
                    onChange={(e) => handleRatingChange(recipe._id, Number(e.target.value))}
                    className="rating-select"
                    disabled={userRatings[recipe._id] === "rated"}
                  >
                    <option value="">Rate this recipe</option>
                    <option value="1">⭐ 1</option>
                    <option value="2">⭐⭐ 2</option>
                    <option value="3">⭐⭐⭐ 3</option>
                    <option value="4">⭐⭐⭐⭐ 4</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5</option>
                  </select>

                  <button
                    className="rate-btn"
                    onClick={() => submitRating(recipe._id)}
                    disabled={userRatings[recipe._id] === "rated"}
                  >
                    Submit Rating
                  </button>

                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {showLogin && !isLoggedIn && (
        <div className="overlay" onClick={closeLogin}>
          <div className="login-form-container" onClick={(e) => e.stopPropagation()}>
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      {showSignup && !isLoggedIn && (
        <div className="overlay" onClick={closeSignup}>
          <div className="signup-form-container" onClick={(e) => e.stopPropagation()}>
            <SignUp onClose={closeSignup} />
          </div>
        </div>
      )}

      <footer className="footer">
        <p>Contact Us: contact@delightfood.com</p>
        <div className="social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
