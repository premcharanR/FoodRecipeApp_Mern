import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./RecipeDetails.module.css"; 

const RecipeDetails = () => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch recipe");
        }
        const data = await response.json();
        setRecipe(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!recipe) return <p>Recipe not found.</p>;

  return (
    <div className={styles["recipe-background"]}> 
      <div className={styles["recipe-container"]}>
        <h2 className={styles["recipe-title"]}>{recipe.title}</h2>

        <p className={styles["recipe-info"]}>
          <strong></strong> {recipe.description}
        </p>

        <div className={styles["recipe-section"]}>
          <h3>📝 Ingredients</h3>
          <ul className={styles["recipe-ingredients"]}>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className={styles["recipe-section"]}>
          <h3> 🍽️Instructions:</h3>
          <p className={styles["recipe-instructions"]}>{recipe.instructions}</p>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
