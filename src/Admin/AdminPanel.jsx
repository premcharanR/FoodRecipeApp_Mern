import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './AdminPanel.css';

const AdminPanel = () => {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [users, setUsers] = useState([]);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [showUsers, setShowUsers] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin-login");
        } else {
            fetchPendingRecipes();
        }
    }, [refreshTrigger, navigate]);

    const fetchPendingRecipes = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("Admin token missing.");

            const response = await fetch("http://localhost:5000/api/recipes/pending", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            setRecipes(data);
        } catch (error) {
            console.error("Error fetching pending recipes:", error);
        }
    };

    const handleRecipeAction = async (id, action) => {
        if (action === "reject" && !rejectionReason.trim()) {
            alert("Please enter a reason for rejection.");
            return;
        }

        setActionLoading(id);
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("Admin token missing.");

            const status = action === "approve" ? "approved" : "rejected";
            const response = await fetch(`http://localhost:5000/api/recipes/${id}/${action}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: action === "reject" ? JSON.stringify({ status, reason: rejectionReason }) : JSON.stringify({ status }),
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            fetchPendingRecipes();
            setSelectedRecipe(null);
            setRejectionReason("");
        } catch (error) {
            console.error(`Error ${action}ing recipe:`, error);
            alert(error.message);
        }
        setActionLoading(null);
    };

    const fetchAllUsers = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) throw new Error("Admin token missing.");

            const response = await fetch("http://localhost:5000/api/admin/users", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            setUsers(data.users);
            setShowUsers(true);
        } catch (error) {
            console.error("Error fetching users:", error.message);
        }
    };

    const deleteUser = async (userId) => {
        try {
            const token = localStorage.getItem("adminToken");
            console.log("token is delete user is : ", token);
            if (!token) throw new Error("Admin token missing.");
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            console.log(data.message);
            window.location.reload();
        } catch (error) {
            console.log("error in delete function : ", error.message);
        }
    }



    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin-login");
    };

    return (
        <div className="admin-panel">

            <div className="navbar">
                <button onClick={fetchAllUsers}>Users</button>
                <button onClick={() => setShowUsers(false)}>Pending Recipes</button>
                <button className="close-button1" onClick={handleLogout}>Logout</button>
            </div>
            {showUsers ? (
                <div className="user-list">
                    {users.length === 0 ? (
                        <p>No users available.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Recipe count</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user._id}
                                        onClick={() => navigate(`/admin/user/${user._id}`)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.recipeCount}</td>
                                        <td>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    deleteUser(user._id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="recipe-grid1">
                    {recipes.length === 0 ? (
                        <p>No pending recipes.</p>
                    ) : (
                        recipes.map((recipe) => (
                            <div
                                key={recipe._id}
                                className="recipe-card"
                                style={{
                                    backgroundImage: `url(http://localhost:5000/${recipe.image.startsWith('uploads/') ? '' : 'uploads/'}${recipe.image}?timestamp=${new Date().getTime()})`,
                                    backgroundSize: '300px 250px',
                                    backgroundPosition: '38px 41px',
                                    backgroundRepeat: 'no-repeat',
                                }}
                            >
                                <h3>{recipe.title}</h3>
                                <button onClick={() => setSelectedRecipe(recipe)}>View Details</button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {selectedRecipe && (
                <div className="modal1">
                    <div className="modal-content1">
                        <h3>{selectedRecipe.name}</h3>
                        <p><strong>Description:</strong> {selectedRecipe.description}</p>
                        <p><strong>Ingredients:</strong> {selectedRecipe.ingredients.join(", ")}</p>
                        <p><strong>Instructions:</strong> {selectedRecipe.instructions}</p>

                        <div className="modal-actions1">
                            <button
                                onClick={() => handleRecipeAction(selectedRecipe._id, "approve")}
                                disabled={actionLoading === selectedRecipe._id}
                            >
                                {actionLoading === selectedRecipe._id ? "Approving..." : "Approve"}
                            </button>
                            <h4>Reject Recipe</h4>
                            <textarea
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <button
                                onClick={() => handleRecipeAction(selectedRecipe._id, "reject")}
                                disabled={actionLoading === selectedRecipe._id}
                            >
                                {actionLoading === selectedRecipe._id ? "Rejecting..." : "Submit Rejection"}
                            </button>
                            <button onClick={() => setSelectedRecipe(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}



        </div>
    );
};

export default AdminPanel;
