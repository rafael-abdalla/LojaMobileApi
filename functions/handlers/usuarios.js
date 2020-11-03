const { admin, db } = require('../util/admin');
const config = require('../util/config');
const firebase = require('firebase');

firebase.initializeApp(config);

const {
  validacaoSignup,
  validacaoLogin,
  validarUsuarioDetalhes,
} = require('../util/validacao');

exports.signup = (request, response) => {
  const usuario = {
    email: request.body.email,
    senha: request.body.senha,
  };

  const { validacao, erros } = validacaoSignup(usuario);

  if (validacao === false) return response.status(400).json(erros);

  let token, codigo;

  firebase
    .auth()
    .createUserWithEmailAndPassword(usuario.email, usuario.senha)
    .then((data) => {
      codigo = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const novoUsuario = {
        codigo: codigo,
        imagemUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/d9cf31198123714c8ff39b7ecbf4dfb50128cc83r1-570-806v2_uhq.jpg?alt=media`,
        email: usuario.email,
        data_criacao: new Date().toISOString(),
      };

      db.collection('usuario')
        .add(novoUsuario)
        .then((doc) => {
          response.json({
            message: `Usuario ${doc.user.uid} criado com sucesso`,
          });
        })
        .catch((err) => {
          return response.status(500).json({ error: err.code });
        });
    })
    .then((data) => {
      return response.status(201).json({ token });
    })
    .catch((err) => {
      switch (err.code) {
        case 'auth/email-already-in-use':
          return response.status(500).json({
            error: `O email ${usuario.email} já está sendo utilizado por outra pessoa`,
          });
        default:
          return response.status(500).json({ error: err.code });
      }
    });
};

exports.login = (request, response) => {
  const usuario = {
    email: request.body.email,
    senha: request.body.senha,
  };

  const { validacao, erros } = validacaoLogin(usuario);

  if (validacao === false) return response.status(400).json(erros);

  firebase
    .auth()
    .signInWithEmailAndPassword(usuario.email, usuario.senha)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return response.json({ token });
    })
    .catch((err) => {
      switch (err.code) {
        case 'auth/wrong-password':
          return response
            .status(403)
            .json({ general: `Login ou senha incorreto(s)` });
        default:
          return response.status(403).json({
            general: `Erro ao tentar efetuar login. Tente novamente mais tarde`,
          });
      }
    });
};

exports.enviarImagem = (request, response) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: request.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return response
        .status(400)
        .json({ error: 'Tipo de arquivo não suportado' });
    }

    const extension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.round(Math.random() * 10000000000)}.${extension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return response.json({
          message: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`,
        });
        // Atualizar foto do usuário
        // return db.doc(`/usuario/w0ruWT1PGJIxmvLGcIM1`).update({ imageUrl });
      })
      .then(() => {
        return response.json({ message: 'Imagem enviada com sucesso' });
      })
      .catch((err) => {
        return response.status(500).json({ error: err.code });
      });
  });
  busboy.end(request.rawBody);
};

exports.detalhesUsuario = (request, response) => {
  let usuarioDetalhes = validarUsuarioDetalhes(request.body);

  db.doc('/usuario/w0ruWT1PGJIxmvLGcIM1')
    .update(usuarioDetalhes)
    .then(() => {
      return response.json({ message: 'Detalhes salvos com sucesso' });
    })
    .catch((err) => {
      return response.status(500).json({ error: err.code });
    });
};
