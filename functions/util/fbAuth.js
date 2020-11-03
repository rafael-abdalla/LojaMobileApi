const { admin, db } = require('./admin');

module.exports = (request, response, next) => {
  let idToken;  
  if(request.headers.authorization && request.headers.authorization.startsWith('Bearer ')){
    idToken = request.headers.authorization.split('Bearer ')[1];
  }else{
    console.error("Nenhum token encontrado")
    return response.status(403).json({ error: "Sem autorização" })
  }

  admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      request.user = decodedToken;      
      return db.collection('usuario')
        .where('codigo', '==', request.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      return next();
    })
    .catch(err => {
      console.error('Erro ao verficar token ', err);
      return response.status(403).json(err);
    });
}