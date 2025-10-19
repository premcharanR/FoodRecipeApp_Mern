import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserDashboard.css";
const UserDashboard = () => {
  const [userEmail, setUserEmail] = useState("");
  const [rejectedRecipes, setRejectedRecipes] = useState([]);
  const [approvedRecipes, setApprovedRecipes] = useState([]);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);

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

    const fetchRecipes = async () => {
      try {
        console.log("Fetching recipes for:", userEmail);
        const formattedEmail = encodeURIComponent(userEmail.trim().toLowerCase());

        const rejectedResponse = await axios.get(
          `http://localhost:5000/api/recipes/rejected?email=${formattedEmail}`,
          { withCredentials: true }
        );
        const approvedResponse = await axios.get(
          `http://localhost:5000/api/recipes/approved?email=${formattedEmail}`,
          { withCredentials: true }
        );

        setRejectedRecipes(rejectedResponse.data || []);
        setApprovedRecipes(approvedResponse.data || []);
      } catch (error) {
        console.error("Error fetching recipes:", error.response?.data || error.message);
      }
    };

    fetchRecipes();
  }, [userEmail]);

  const handleDelete = async (recipeId) => {
    try {
      console.log("Deleting recipe with ID:", recipeId);
      await axios.delete(`http://localhost:5000/api/recipes/${recipeId}`, { withCredentials: true });

      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe._id !== recipeId));
      setRejectedRecipes((prevRejected) => prevRejected.filter((recipe) => recipe._id !== recipeId));
      setApprovedRecipes((prevApproved) => prevApproved.filter((recipe) => recipe._id !== recipeId));

      alert("Recipe deleted successfully!");
    } catch (error) {
      console.error("Error deleting recipe:", error.response?.data || error.message);
    }
  };
  const handleCancelEdit = () => {
    setEditingRecipe(null);
  };


  const handleEdit = (recipe) => {
    setEditingRecipe({
      _id: recipe._id,
      title: recipe.title,
      ingredients: recipe.ingredients,
      description: recipe.description,
      instructions: recipe.instructions || "",
      image: recipe.image || "",
    });
  };
  console.log("Editing Recipe Before Update:", editingRecipe);

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

      console.log("Update Response:", response.data);

      if (response.status === 200) {
        setRecipes((prevRecipes) => {
          const newRecipes = prevRecipes.map((recipe) =>
            recipe._id === id ? { ...recipe, ...updatedData, status: "pending" } : recipe
          );
          return [...newRecipes];
        });

        alert("Recipe Goes for Verification");
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
      <h2 className="header">Approved Recipes</h2>

      <div className="approved-recipe-section">
        {approvedRecipes.length === 0 ? (
          <p>No approved recipes found.</p>
        ) : (
          <div className="recipe-list">
            {approvedRecipes.map((recipe) => (
              <li key={recipe._id} className="recipe-list-item approved-recipe-item">
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                {recipe.image && (
                  <img
                    src={`http://localhost:5000/${recipe.image.startsWith('uploads/') ? '' : 'uploads/'}${recipe.image}?timestamp=${new Date().getTime()}`}
                    alt="Recipe"
                    className="recipe-image"
                  />
                )}
                <div className="recipe-actions">
                  <button onClick={() => handleEdit(recipe)}>Edit</button>
                  <button onClick={() => handleDelete(recipe._id)}>Delete</button>
                </div>
              </li>
            ))}
          </div>
        )}
      </div>

      <div className="rejected-recipe-section">
        <h2>Rejected Recipes</h2>
        {rejectedRecipes.length === 0 ? (
          <p>No rejected recipes found.</p>
        ) : (
          <ul className="rejected-recipe-list">
            {rejectedRecipes.map((recipe) => (
              <li key={recipe._id} className="recipe-list-item rejected-recipe-item">
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <p><strong>Rejection Reason:</strong> {recipe.rejectionReason}</p>
                {recipe.image && (
                  <img
                    src={`http://localhost:5000/${recipe.image.startsWith('uploads/') ? '' : 'uploads/'}${recipe.image}?timestamp=${new Date().getTime()}`}
                    alt="Recipe"
                    className="recipe-image"
                  />
                )}
                <div className="recipe-actions">
                  <button onClick={() => handleEdit(recipe)}>Edit</button>
                  <button onClick={() => handleDelete(recipe._id)} style={{ color: "red" }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>


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
            value={editingRecipe.ingredients}
            onChange={(e) => setEditingRecipe({ ...editingRecipe, ingredients: e.target.value })}
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
          {editingRecipe.image && (
            <img
              src={
                editingRecipe.imageFile
                  ? URL.createObjectURL(editingRecipe.imageFile)
                  : `http://localhost:5000/${editingRecipe.image.startsWith('uploads/') ? '' : 'uploads/'}${editingRecipe.image}`
              }
              alt="Current Recipe"
              className="recipe-image"
            />
          )}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={() => handleUpdate(editingRecipe._id)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Back
            </button>
          </div>

        </div>
      )}
    </div>
  );

}
export default UserDashboard;
