require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");




const { connectDB}  = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const helloRoutes = require("./routes/helloRoute");
const booksRoutes = require("./routes/booksRoutes");
const publicUrlRoutes = require("./routes/publicUrlRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet());
app.use(express.json());

// app.use(cors({
//   origin: "http://localhost:8080",
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

app.use(
cors({
origin: "https://zahiq-ibrahim-bookshelf-nook-library.book-shelf-api.workers.dev",
methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"],
})
);

app.use("/api/v1/health", helloRoutes);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/books", booksRoutes);
app.use("/library", publicUrlRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start application:", error.message);
        process.exit(1);
    }
}

startServer();

