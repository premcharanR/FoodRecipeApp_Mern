import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./UserDetails.css";

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [modalRecipe, setModalRecipe] = useState(null); 
    
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                if (!token) throw new Error("Admin token missing.");

                const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                setUserData(data.user);
                setRecipes(data.recipe);
            } catch (error) {
                console.log("Error fetching user details:", error.message);
            }
        };

        fetchUserDetails();
    }, [userId]);

   
    const openModal = (recipe) => {
        setModalRecipe(recipe);
    };

   
    const closeModal = () => {
        setModalRecipe(null);
    };


    const handleDeleteRecipe = async (recipeId) => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("Admin token missing.");

            const response = await fetch(`http://localhost:5000/api/admin/recipes/${recipeId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setRecipes(recipes.filter((recipe) => recipe._id !== recipeId));
                alert(data.message || "Recipe deleted successfully");
            } else {
                alert(data.error || "Failed to delete recipe");
            }
        } catch (error) {
            console.log("Error deleting recipe:", error.message);
        }
    };

    return (
        <div className="user-details-container">
            <h2 className="user-title">User Details</h2>

            {userData ? (
                <div className="user-card">
                    <p className="user-info">
                        <strong>Name:</strong> {userData.name}
                    </p>
                    <p className="user-info">
                        <strong>Email:</strong> {userData.email}
                    </p>
                    <p className="user-info">
                        <strong>Total Recipes:</strong> {recipes.length}
                    </p>

                   
                    <div className="recipes-container">
                        <h3 className="recipes-title">Recipes</h3>

                        {recipes.length > 0 ? (
                            <div className="recipes-grid">
                                {recipes.map((recipe) => (
                                    <div key={recipe._id} className="recipe-box">
                                        <div className="recipe-card">
                                            <h4 className="recipe-title">{recipe.title}</h4>
                                            <p className="recipe-description">{recipe.description}</p>
                                            <img
                                                src={`http://localhost:5000/${
                                                    recipe.image.startsWith("uploads/") ? "" : "uploads/"
                                                }${recipe.image}?timestamp=${new Date().getTime()}`}
                                                alt={recipe.title || "Recipe Image"}
                                                className="recipe-img-shape"
                                                onError={(e) => (e.target.src = "/fallback-image.jpg")}
                                            />

                                            <button
                                                onClick={() => openModal(recipe)}
                                                className="details-button"
                                            >
                                                Show Details
                                            </button>
                                        </div>

                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteRecipe(recipe._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-recipes">No recipes found.</p>
                        )}
                    </div>
                </div>
            ) : (
                <p className="loading-text">Loading user details...</p>
            )}

          
            {modalRecipe && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{modalRecipe.title}</h2>
                        <h3>📝 Ingredients:</h3>
                        <ul   className="ingredients-list" style={{ fontSize: '15px'}}>
                            {modalRecipe.ingredients.map((ingredient, index) => (
                                <li key={index}>{ingredient}</li>
                            ))}
                        </ul>
                        <h3 >🍽️ Instructions:</h3>
                        <p style={{ fontSize: '15px'}} >{modalRecipe.instructions}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetails;
