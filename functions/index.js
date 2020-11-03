const functions = require('firebase-functions');
const express = require('express');
const app = express();

app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (request.method === 'OPTIONS') {
    response.header(
      'Access-Control-Allow-Methods',
      'PUT, POST, PATCH, DELETE, GET'
    );
    return response.status(200).send({});
  }

  next();
});

const FBAuth = require('./util/fbAuth');
const { listaProdutos, gravarProduto } = require('./handlers/produtos');
const {
  signup,
  login,
  enviarImagem,
  detalhesUsuario,
} = require('./handlers/usuarios');

//Rotas para produtos
app.get('/produtos', listaProdutos);
app.post('/produtos', FBAuth, gravarProduto);
//Rotas para usuários
app.post('/signup', signup);
app.post('/login', login);
app.post('/usuarios/imagens', FBAuth, enviarImagem);
app.post('/usuarios/detalhes', FBAuth, detalhesUsuario);

exports.api = functions.https.onRequest(app);
