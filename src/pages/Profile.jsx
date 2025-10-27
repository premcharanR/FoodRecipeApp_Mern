import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch("http://localhost:5000/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    try {
                        const data = await response.json();
                        if (data && data.message && data.message.includes("expired")) {
                            console.error("Token expired:", data.message);
                            localStorage.removeItem("token"); 
                            navigate("/login");
                            return;
                        }
                    } catch (jsonError) {
                        console.error("Error parsing JSON:", jsonError);
                    }
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Data from /api/profile:", data);
            setUser(data.user);
            setRecipes(data.recipes);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchProfile();
}, [navigate]);

  const handleEditRecipe = (recipeId) => {
    navigate(`/edit-recipe/${recipeId}`);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete recipe");
      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe._id !== recipeId));
    } catch (error) {
      alert("Error deleting recipe: " + error.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="profile-container">
      <h2>Welcome, {user?.name}!</h2>
      <p>Email: {user?.email}</p>

      <h3>Your Recipes</h3>
      {recipes.length === 0 ? (
        <p>You haven't added any recipes yet.</p>
      ) : (
        <div className="recipe-list">
         {recipes.map((recipe) => (
    <div key={recipe._id || recipe.id || "no-id"} className="recipe-item">
              <h4>{recipe.title}</h4>
              <p>{recipe.description}</p>
              <button className="edit-btn" onClick={() => handleEditRecipe(recipe._id)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDeleteRecipe(recipe._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;