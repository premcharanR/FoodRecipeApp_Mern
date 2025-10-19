const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const router = express.Router();
const Recipe = require("../models/Recipe");
const requireAuth = require("../middleware/authMiddleware");
const User = require("../models/User"); 
const { updateRecipeStatus } = require("../controllers/recipeController");


const {
  getAllRecipes,
  createRecipe,
  approveRecipe,
  rejectRecipe,
  getRejectedRecipes,
  getRejectedRecipesByEmail,
} = require("../controllers/recipeController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});
const upload = multer({ storage });

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { title, description, ingredients, instructions, user } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!user) {
      return res.status(400).json({ error: "User is required" });
    }

    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      instructions,
      image,
      user,
    });

    await newRecipe.save();
    res.status(201).json({ message: "Recipe added successfully!", recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "This is a test route (no auth)" });
});

router.get("/", async (req, res) => {
  try {
    console.log("Fetching approved recipes...");
    const recipes = await Recipe.find({ status: "approved" });
    console.log("Fetched recipes:", recipes);
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/public", async (req, res) => {
  try {
    const approvedRecipes = await Recipe.find({ status: "approved" });

    if (!approvedRecipes || approvedRecipes.length === 0) {
      return res.status(404).json({ message: "No approved recipes found" });
    }

    res.json(approvedRecipes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching approved recipes", error: error.message });
  }
});

router.get("/pending", async (req, res) => {
  try {
    const recipes = await Recipe.find({ status: "pending" });
    if (!recipes.length) {
      return res.status(404).json({ message: "No pending recipes found" });
    }
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching pending recipes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, ingredients, instructions } = req.body;
    const image = req.file ? `uploads/${req.file.filename}` : undefined;
    const updateData = { title, description, ingredients, instructions, status: "pending" }; 
    if (image) updateData.image = image; 
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json({ message: "Recipe updated. Awaiting admin approval!", recipe: updatedRecipe });
  } catch (error) {
    res.status(500).json({ message: "Error updating recipe", error });
  }
});


router.put("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }
    const recipe = await Recipe.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json({ message: "Recipe approved successfully", recipe });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      { status: "rejected", rejectionReason: reason },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe rejected successfully", recipe });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.put("/:id/status", updateRecipeStatus);
router.get("/rejected", getRejectedRecipesByEmail)

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("DELETE request received for Recipe ID:", id);

   
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid recipe ID format" });
    }

  
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

 
    await Recipe.findByIdAndDelete(id);
    res.json({ message: "Recipe deleted successfully" });

  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.params.userId }).populate('user', 'name email');

    if (!recipes.length) {
      return res.status(404).json({ message: "No recipes found for this user" });
    }

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user recipes", error: error.message });
  }
});
router.get("/approved", async (req, res) => {
  try {
      const { email } = req.query;

      if (!email) {
          return res.status(400).json({ error: "Email is required" });
      }

      
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

    
      const approvedRecipes = await Recipe.find({ 
          user: user._id, 
          status: "approved" 
      });

      res.json(approvedRecipes);
  } catch (error) {
      console.error("Error fetching approved recipes:", error);
      res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/:recipeId/rate", requireAuth, async (req, res) => {
  try {
    const { rating } = req.body;
    const { recipeId } = req.params;
    console.log("User Object in Middleware:", req.user); 

    const userId = req.user?.id; 
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User not found!" });
    }
    console.log("Received rating:", rating, "User:", userId, "Recipe:", recipeId);
   

    if (!mongoose.Types.ObjectId.isValid(recipeId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid Recipe or User ID" });
    }

    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

  
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    
    const existingRating = recipe.ratings.find(r => r.userId.equals(userId));

    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this recipe!" });
    }


    recipe.ratings.push({ userId, rating });

    console.log("Updated Ratings Before Save:", recipe.ratings); 


    const totalRatings = recipe.ratings.length;
    const sumRatings = recipe.ratings.reduce((sum, r) => sum + r.rating, 0);
    recipe.averageRating = parseFloat((sumRatings / totalRatings).toFixed(1)); 

    console.log("Updated Average Rating Before Save:", recipe.averageRating); 

    await recipe.save();  

    console.log("Saved Recipe:", await Recipe.findById(recipeId)); 

    res.json({ message: "Rating submitted successfully!", averageRating: recipe.averageRating });
  } catch (error) {
    console.error("❌ Rating Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




module.exports = router;