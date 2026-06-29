const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./db"); 
const auth = require("./middleware/auth.js");
const app = express();
const authRouter = require('./controllers/User');
const carsController = require('./controllers/CarsControlelr');
//specjalny endpoint do sprawdzania stanu serwera, przydatny do healthcheck w docker-compose 
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true
})); 

const port = process.env.PORT || 3000;
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.use('/auth', authRouter); 

app.use('/', auth, carsController); 

app.get("/api-status", (req, res) => {
    res.json({ status: "Serwer działa poprawnie" });
});

app.listen(port, () => {
    console.log(`Serwer nasłuchuje na porcie ${port}`);
});