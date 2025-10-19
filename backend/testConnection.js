const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://premcharan:1234@cluster0.01tny.mongodb.net/foodrecipe?retryWrites=true&w=majority')
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.log("MongoDB connection error:", err);
  });
