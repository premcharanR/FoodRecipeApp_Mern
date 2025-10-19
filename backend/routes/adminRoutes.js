const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose"); 
const verifyAdminToken = require("./verifyAdminToken");
const Admin = require("../models/Admin"); 
const Recipe = require("../models/Recipe"); 
const User = require("../models/User");

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("📩 Received Login Request:", req.body);

    try {
        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (!admin) {
            console.log("❌ Admin not found.");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("🔑 Stored Hashed Password:", admin.password);

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);

        if (!isPasswordCorrect) {
            console.log("❌ Passwords do not match.");
            return res.status(401).json({ message: "Invalid email or password" });
        }

       
        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: "10h" });

        console.log("✅ Login Successful! Token:", token);

        return res.json({ message: "Admin login successful", token });
    } catch (error) {
        console.error("❌ Login Error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/users", verifyAdminToken, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        const recipeCount = await Promise.all(
            users.map(async (user) => {
                const userrecipecount = await Recipe.countDocuments({
                    user: user._id
                });
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    recipeCount: userrecipecount,
                };
            })
        );
        return res.status(200).json({ users: recipeCount });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message });
    }
});

router.get("/users/:userId", verifyAdminToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findOne({ _id: userId }).select('-password');
        const userRecipes = await Recipe.find({ user: user._id });
        const count = userRecipes.length;
        return res.status(200).json({
            message: 'successfully retrived',
            user,
            recipe: userRecipes,
            count: count
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message });
    }
})

router.delete("/recipes/:recipeId",verifyAdminToken,async(req,res)=>{
    const {recipeId} = req.params;
    try {
        const deletedRecipe = await Recipe.findByIdAndDelete({_id:recipeId});
        return res.status(200).json({message:'recipe deleted successfully'});
    } catch (error) {
        console.log('in deleting recipe : ',error.message);
        return res.status(500).json({message:error.message});
    }
});

router.delete("/users/:userId", verifyAdminToken, async (req, res) => {
    const { userId } = req.params;
    console.log('in delete function user id is : ' + userId); 
    try {
        const deletedUser = await User.findByIdAndDelete({ _id: userId });
        const deletedRecipes = await Recipe.deleteMany({ user: userId });
        return res.status(200).json({ message: 'Deleted user' });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message });
    }
});

router.put("/approve/:id", verifyAdminToken, async (req, res) => {
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

        console.log("✅ Recipe Approved:", recipe);

        return res.status(200).json({ message: "Recipe approved successfully", recipe });
    } catch (error) {
        console.error("❌ Error approving recipe:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});


router.put("/reject/:id", verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid recipe ID" });
        }

        if (!rejectionReason) {
            return res.status(400).json({ message: "Rejection reason is required" });
        }

        const recipe = await Recipe.findByIdAndUpdate(
            id,
            { status: "rejected", rejectionReason },
            { new: true }
        );

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        console.log("❌ Recipe Rejected:", recipe);

        return res.status(200).json({ message: "Recipe rejected successfully", recipe });
    } catch (error) {
        console.error("❌ Error rejecting recipe:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
