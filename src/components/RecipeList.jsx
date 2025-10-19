import React, { useEffect, useState } from "react";
import axios from "axios";

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/recipes");
        setRecipes(response.data.recipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div>
      <h2>Recipe List</h2>
      <div>
        {recipes.length === 0 ? (
          <p>No recipes available</p>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe._id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px", borderRadius: "8px" }}>
              <h3>{recipe.title}</h3>
              <img src={`http://localhost:5000/uploads/${recipe.image}`} alt={recipe.title || "Recipe Image"} className="recipe-img-shape" onError={(e) => e.target.src = "fallback-image.jpg"} />
              <p><strong>Description:</strong> {recipe.description}</p>
              <p><strong>Ingredients:</strong> {recipe.ingredients.join(", ")}</p>
              <p><strong>Instructions:</strong> {recipe.instructions}</p>
              <p><strong>Status:</strong> {recipe.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecipeList;
