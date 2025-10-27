import React, { useState, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./RecipeForm.css";

const RecipeForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null); 

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("🚨 No token found! Please log in.");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken);
      const userId = decodedToken?.userId || decodedToken?.id;

      if (!userId) {
        console.error("❌ User ID not found in token!");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("ingredients", ingredients);
      formData.append("instructions", instructions);
      formData.append("image", image);
      formData.append("user", userId);

      const response = await axios.post(
        "http://localhost:5000/api/recipes/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Recipe added successfully:", response.data);
      setMessage("Recipe Goes for Verification");

      
      setTitle("");
      setDescription("");
      setIngredients("");
      setInstructions("");
      setImage(null);

    
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }


      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error("❌ Error adding recipe:", error.response?.data || error);
      setMessage("Failed to add recipe!");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  return (
    <div className="recipe-form-container">
      <h2 className="recipe-form-title">Add Recipe</h2>

      <div className="recipe-form-wrapper">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <textarea
            placeholder="Ingredients (comma-separated)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />
          <textarea
            placeholder="Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef} 
            required
          />

          {image && (
            <div className="image-preview">
              <p>Image Preview:</p>
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="preview-image"
              />
            </div>
          )}

          <button type="submit">Submit</button>
        </form>
      </div>

      {message && (
        <p className={message.includes("success") ? "success-message" : "error-message"}>
          {message}
        </p>
      )}
    </div>
  );
};

export default RecipeForm;
