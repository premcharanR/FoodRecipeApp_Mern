const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const MongoStore = require("connect-mongo");
const cookieparser = require('cookie-parser');


const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const recipeRoutes = require("./routes/recipeRoutes");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(helmet()); 
app.use(morgan("dev")); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser(process.env.COOKIES_SECRET));

app.use(
    session({
      secret: process.env.SESSION_SECRET || "default_secret",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "sessions",
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production", 
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24, 
      },
    })
  );


mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });


process.on("SIGINT", async () => {
    console.log("\n🔴 Closing MongoDB Connection...");
    await mongoose.connection.close();
    console.log("✅ MongoDB Disconnected");
    process.exit(0);
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/recipes", recipeRoutes);


app.get("/testroute", (req, res) => {
    res.send("✅ Test route working!");
});


app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.message);
    res.status(err.status || 500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
const frontendPath = path.join(__dirname, "src", "dist");
app.use(express.static(frontendPath));

// Catch-all route to serve React index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});
