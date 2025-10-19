import React, { useState, useEffect } from "react";
import axios from "axios";

const UserRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserRecipes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/recipes/user-recipes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
      });
      setRecipes(response.data); 
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch recipes");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRecipes(); 
  }, []);

  if (loading) return <p>Loading recipes...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Your Recipes</h2>
      {recipes.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {recipes.map((recipe) => (
            <div 
              key={recipe._id} 
              style={{ 
                border: "1px solid #ddd", 
                padding: "15px", 
                borderRadius: "8px", 
                width: "300px",
                textAlign: "center"
              }}
            >
              <h3>{recipe.title}</h3>
              {recipe.image && (
                <img src={`http://localhost:5000/uploads/${recipe.image}`} alt={recipe.title} style={{ maxWidth: "100px", marginRight: "10px" }} onError={(e) => e.target.src = "fallback-image.jpg"} />
              )}
              <p><strong>Description:</strong> {recipe.description}</p>
              <p><strong>Ingredients:</strong> {recipe.ingredients.join(", ")}</p>
              <p><strong>Instructions:</strong> {recipe.instructions}</p>
              <p><strong>Status:</strong> {recipe.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontStyle: "italic", color: "#555" }}>You haven't added any recipes yet!</p>
      )}
    </div>
  );
};

export default UserRecipes;
