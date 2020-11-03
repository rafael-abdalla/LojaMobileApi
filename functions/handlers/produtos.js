const { db } = require('../util/admin');

exports.listaProdutos = (request, response) => {
  db
    .collection('produto')
    .get()
    .then((data) => {
      let produtos = [] ;
      data.forEach((doc) => {            
        produtos.push({
          produtoId: doc.id,
          foto: doc.data().foto,
          nome: doc.data().nome,
          categoria: doc.data().categoria,
          descricao: doc.data().descricao,
          caracteristicas: doc.data().caracteristicas,
          preco: doc.data().preco,
          frete: doc.data().frete
        });
      });
      return response.json(produtos);
    })
    .catch((err) => {
      response.status(500).json({ error: err.code });
    });
}

exports.gravarProduto = (request, response) => {  
  const produto = {  
    foto: request.body.foto,
    nome: request.body.nome,
    categoria: request.body.categoria,
    descricao: request.body.descricao,
    preco: request.body.preco,
    frete: request.body.frete,
    caracteristicas: request.body.caracteristicas
  }

  db
    .collection('produto')
      .add(produto)
      .then((doc) => {
        response.json({ message: `documento ${doc.id} criado com sucesso` })
      })
      .catch((err) => {
        response.status(500).json({ error: 'algo deu errado' });
      });
}