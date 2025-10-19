import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const RejectedRecipes = () => {
  const [userEmail, setUserEmail] = useState("");
  const [rejectedRecipes, setRejectedRecipes] = useState([]);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem("userEmail");
    if (!loggedInUserEmail) {
      console.error("No logged-in user email found.");
      return;
    }
    setUserEmail(loggedInUserEmail);
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const fetchRejectedRecipes = async () => {
      try {
        console.log("Fetching rejected recipes for:", userEmail);
        const formattedEmail = encodeURIComponent(userEmail.trim().toLowerCase());

        const rejectedResponse = await axios.get(
          `http://localhost:5000/api/recipes/rejected?email=${formattedEmail}`,
          { withCredentials: true }
        );

        setRejectedRecipes(rejectedResponse.data || []);
      } catch (error) {
        console.error("Error fetching rejected recipes:", error.response?.data || error.message);
      }
    };

    fetchRejectedRecipes();
  }, [userEmail]);

  const handleDelete = async (recipeId) => {
    try {
      console.log("Deleting recipe with ID:", recipeId);
      await axios.delete(`http://localhost:5000/api/recipes/${recipeId}`, { withCredentials: true });

      setRejectedRecipes((prevRejected) => prevRejected.filter((recipe) => recipe._id !== recipeId));

      alert("Recipe deleted successfully!");
    } catch (error) {
      console.error("Error deleting recipe:", error.response?.data || error.message);
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe({
      _id: recipe._id,
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions || "",
      image: recipe.image || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("title", editingRecipe.title);
      formData.append("description", editingRecipe.description);
      formData.append("instructions", editingRecipe.instructions);
      if (editingRecipe.imageFile) {
        formData.append("image", editingRecipe.imageFile);
      }

      const response = await axios.put(
        `http://localhost:5000/api/recipes/${id}`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        setRejectedRecipes((prevRejected) =>
          prevRejected.map((recipe) =>
            recipe._id === id ? { ...recipe, ...response.data, status: "pending" } : recipe
          )
        );

        alert("Recipe sent for re-verification!");
        setEditingRecipe(null);
      } else {
        alert("Update failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };

  return (
    <div className="user-dashboard-container">
      <h2 className="dashboard-header">Rejected Recipes</h2>
      <button className="switch-page-btn" onClick={() => navigate("/approved-recipes")}>
        View Approved Recipes
      </button>

      {rejectedRecipes.length === 0 ? (
        <p className="no-recipes">No rejected recipes found.</p>
      ) : (
        <div className="recipe-container">
          {rejectedRecipes.map((recipe) => (
            <div key={recipe._id} className="recipe-card">
              <h3 className="recipe-title">{recipe.title}</h3>
              <p className="recipe-description">{recipe.description}</p>
              {recipe.image && (
                <img
                  src={`http://localhost:5000/${recipe.image.startsWith('uploads/') ? '' : 'uploads/'}${recipe.image}`}
                  alt="Recipe"
                  className="recipe-image"
                />
              )}
              <div className="button-container">
                <button className="edit-btn" onClick={() => handleEdit(recipe)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(recipe._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingRecipe && (
        <div className="edit-recipe-form">
          <h2>Edit Recipe</h2>
          <input
            type="text"
            value={editingRecipe.title}
            onChange={(e) => setEditingRecipe({ ...editingRecipe, title: e.target.value })}
          />
          <textarea
            value={editingRecipe.description}
            onChange={(e) => setEditingRecipe({ ...editingRecipe, description: e.target.value })}
          />
          <textarea
            value={editingRecipe.instructions}
            onChange={(e) => setEditingRecipe({ ...editingRecipe, instructions: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setEditingRecipe({ ...editingRecipe, imageFile: e.target.files[0] })}
          />
          <button className="edit-btn" onClick={() => handleUpdate(editingRecipe._id)}>Save Changes</button>
          <button className="delete-btn" onClick={handleCancelEdit}>Back</button>
        </div>
      )}
    </div>
  );
};

export default RejectedRecipes;
