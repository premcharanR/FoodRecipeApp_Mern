const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true }, 
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, 
    image: { type: String, required: false }, 
    rejectionReason: { type: String, default: "" },

    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { 
          type: Number, 
          min: 1, 
          max: 5, 
          required: true,
          validate: {
            validator: Number.isFinite, 
            message: "Rating must be a valid number between 1 and 5.",
          },
        },
      },
    ],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true } 
);

recipeSchema.methods.getAverageRating = function () {
  const validRatings = this.ratings.filter(r => r && typeof r.rating === "number");
  if (validRatings.length === 0) return 0;
  
  const sum = validRatings.reduce((total, r) => total + r.rating, 0);
  return parseFloat((sum / validRatings.length).toFixed(1));
};

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
