const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { connectToMongo } = require("./database/connect");

const PORT = process.env.PORT || 3001;
const apiKEY = process.env.API_KEY; 

connectToMongo();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // You can specify the allowed origins here
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true,
  optionSuccessStatus: 200,
}

app.enable("trust proxy");

app.get("/", async (req, res,) => {
    try{
    const response = await axios.get(apiKEY);
    const data = response.data;
    res.json(data);
    } catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Erro ao consumir a API externa' });
}
});

app.listen(PORT);

module.exports = { app };