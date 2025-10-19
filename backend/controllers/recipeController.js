const Recipe = require("../models/Recipe");
const mongoose = require("mongoose");
const User = require("../models/User"); 

const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ status:"approved" }); 
        res.status(200).json(recipes);
    } catch (error) {
        console.error("❌ Error fetching recipes:", error);
        res.status(500).json({ message: "Error fetching recipes", error: error.message });
    }
};

const createRecipe = async (req, res) => {
    try {
        
        if (!req.file) {
            return res.status(400).json({ error: "Image is required" });
        }

        const userId = req.user?.userId || req.user?._id;
        if (!userId) {
            console.error("❌ Unauthorized: Missing User ID");
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }

     
        const { title, description, ingredients, instructions } = req.body;
        if (!title || !description || !ingredients || !instructions) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const ingredientsArray = Array.isArray(ingredients)
            ? ingredients
            : ingredients.split(",").map(ing => ing.trim());

        const newRecipe = new Recipe({
            title,
            description,
            ingredients: ingredientsArray,
            instructions,
            image: `/uploads/${req.file.filename}`, 
            user: mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId.toString()) : userId,
            status: "pending",
            approved: false,
            rejectionReason: null 
        });

      
        await newRecipe.save();
        console.log("✅ Recipe created successfully:", newRecipe);

        res.status(201).json({ message: "Recipe created successfully", recipe: newRecipe });

    } catch (error) {
        console.error("❌ Error creating recipe:", error);
        res.status(500).json({ message: "Error creating recipe", error: error.message });
    }
};


const approveRecipe = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("🔍 Approving Recipe ID:", id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid recipe ID" });
        }

        const recipe = await Recipe.findByIdAndUpdate(
            id,
            { status: "approved", rejectionReason: null }, 
            { new: true }
        );

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.status(200).json({ message: "Recipe approved successfully", recipe });
    } catch (error) {
        console.error("❌ Error approving recipe:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const rejectRecipe = async (req, res) => {
    try {
        const { reason } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid recipe ID" });
        }
        const updatedRecipe = await Recipe.findByIdAndUpdate(id, { status: "Rejected" }, { new: true });

        const recipe = await Recipe.findByIdAndUpdate(
            id,
            {status: "rejected", rejectionReason: reason },
            { new: true }
        );

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.status(200).json({ message: "Recipe rejected successfully", recipe });
    } catch (error) {
        console.error("❌ Error rejecting recipe:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getPendingRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({status: "pending" }); 
        res.status(200).json(recipes);
    } catch (error) {
        console.error("❌ Error fetching pending recipes:", error);
        res.status(500).json({ message: "Error fetching pending recipes", error: error.message });
    }
};

const getRejectedRecipesByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const rejectedRecipes = await Recipe.find({ 
            user: user._id, 
            status: "rejected" 
        });

        res.json(rejectedRecipes);
    } catch (error) {
        console.error("Error fetching rejected recipes:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const getApprovedRecipesByEmail = async (req, res) => {
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
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateRecipeStatus = async (req, res) => {
    try {
        const { status, reason } = req.body; 
        const recipe = await Recipe.findById(req.params.id); 

        if (!recipe) return res.status(404).json({ error: "Recipe not found" });
        if (req.file) {
            updatedFields.image = req.file.filename;
        }
        recipe.status = status; 

        if (status === "rejected" && reason) {
            recipe.rejectionReason = reason; 
        }

        await recipe.save(); 

        res.json(recipe); 
    } catch (error) {
        console.error("Error updating recipe status:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    getAllRecipes,
    createRecipe,
    approveRecipe,
    rejectRecipe,
    getPendingRecipes,
    getRejectedRecipesByEmail,
    getApprovedRecipesByEmail,
    updateRecipeStatus ,
};
