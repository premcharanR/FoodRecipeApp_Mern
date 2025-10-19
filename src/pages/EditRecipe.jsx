import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditRecipe = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/recipes/${id}`)
      .then((response) => setRecipe(response.data))
      .catch((error) => console.error(error));
  }, [id]);

  const handleChange = (e) => {
    setRecipe({ ...recipe, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:5000/recipes/${id}`, recipe)
      .then(() => {
        alert("Recipe updated successfully!");
        navigate("/user-recipes"); 
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <h2>Edit Recipe</h2>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input type="text" name="title" value={recipe.title} onChange={handleChange} required />

        <label>Description:</label>
        <textarea name="description" value={recipe.description} onChange={handleChange} required />

        <label>Ingredients (comma-separated):</label>
        <input type="text" name="ingredients" value={recipe.ingredients} onChange={handleChange} required />

        <label>Instructions:</label>
        <textarea name="instructions" value={recipe.instructions} onChange={handleChange} required />
        

        <button type="submit">Update Recipe</button>
      </form>
    </div>
  );
};

export default EditRecipe;
