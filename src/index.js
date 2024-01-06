const express = require('express');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { connectToMongo } = require("./database/connect");
const User = require('../models/User');

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

app.get("/", (req, res) => {
  res.send({ working: true });
});

//Private Route
app.get("/user/:id", checkToken, async (req, res) => {

  const id = req.params.id

  //check if user exist
  const user = await User.findById(id, '-password')

  if(!user){
    return res.status(404).json({ msg: 'Usuário não encontrado!' })
  }

  res.status(200).json({ user })
})

function checkToken(req, res, next){

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(" ")[1]

  if(!token){
    return res.status(401).json({ msg: "Acesso negado!" })
  }

  try{

    const secret = process.env.SECRET

    jwt.verify(token, secret)

    next()

  }catch(error){
    res.status(400).json({ msg: 'Token inválido!' })
  }


}

// Resgister User
app.post('/auth/register', async (req, res) => {
  const { username, password, confirmpassword } = req.body;

  if(!username){
    return res.status(422).json({ msg: "O username é obrigatório!" })
  }

  if(!password){
    return res.status(422).json({ msg: "O password é obrigatório!" })
  }

  if(password ==! confirmpassword){
    return res.status(422).json({ msg: "As senhas são diferentes!" })
  }

  const userExist = await User.findOne({ username: username })

  if(userExist) {
    return res.status(422).json({ msg: "Usuário já existe!" })
  }

  
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  //create user
  const user = new User({
    username,
    password: passwordHash,
  })

  try {

    await user.save()

    res.status(201).json({ msg: 'Usuário criado com sucesso!' })


  } catch(error){
    res.status(500).json({  msg: 'Erro no servidor, tente novamente!' })
  }
});

//Login User
app.post("/auth/login", async (req, res) => {

  const {username, password} = req.body;

  //validations
  if(!username){
    return res.status(422).json({ msg: "O username é obrigatório!" })
  }

  if(!password){
    return res.status(422).json({ msg: "O password é obrigatório!" })
  }

  //check if user exist
  const user = await User.findOne({ username: username })

  if(!user) {
    return res.status(422).json({ msg: "Usuário não encontrado!" })
  }

  //check if password math
  const ckeckPassword = await bcrypt.compare(password, user.password)

  if(!ckeckPassword){
    return res.status(422).json({ msg: "Senha inválida :v" })
  }

  try{

    const secret = process.env.SECRET

    const token = jwt.sign({
      id: user._id,
    },
      secret,
    )

    res.status(200).json({ msg: 'Autenticação realizada com sucesso!', token })
  }catch(err){
    res.status(500).json({  msg: 'Erro no servidor, tente novamente!' })
  }
})

app.listen(PORT);

module.exports = { app };