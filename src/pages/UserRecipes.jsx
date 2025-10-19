import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const userId = localStorage.getItem("userId"); 
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/recipes/user/${userId}`)
      .then((response) => setRecipes(response.data))
      .catch((error) => console.error(error));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      axios
        .delete(`http://localhost:5000/recipes/${id}`)
        .then(() => {
          setRecipes(recipes.filter((recipe) => recipe._id !== id));
        })
        .catch((error) => console.error(error));
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-recipe/${id}`); 
  };

  return (
    <div>
      <h2>My Recipes</h2>
      {recipes.length > 0 ? (
        recipes.map((recipe) => (
          <div key={recipe._id} style={{ border: "1px solid #ddd", padding: "10px", margin: "10px" }}>
            <h3>{recipe.title}</h3>
            <button onClick={() => handleDelete(recipe._id)} style={{ marginRight: "10px" }}>Delete</button>
            <button onClick={() => handleEdit(recipe._id)}>Edit</button>
          </div>
        ))
      ) : (
        <p>You have no recipes added yet.</p>
      )}
    </div>
  );
};

export default UserRecipes;
