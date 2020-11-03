const vazio = (value) => {
  if (value.trim() === '') return true;
  else return false;
};

const validarEmail = (email) => {
  const regEx = /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{1,3})+$/;
  if (email.match(regEx)) return true;
  else return false;
};

exports.validacaoSignup = (data) => {
  let erros = {};

  if (vazio(data.email)) {
    erros.email = 'Informe um endereço de email';
  } else if (validarEmail(data.email) === false) {
    erros.email = 'Informe um endereço de email válido';
  }

  if (vazio(data.senha)) erros.senha = 'Informe uma senha';

  return {
    erros,
    validacao: Object.keys(erros).length === 0 ? true : false,
  };
};

exports.validacaoLogin = (data) => {
  let erros = {};

  if (vazio(data.email)) erros.email = 'Informe um endereço de email';
  else if (validarEmail(data.email) === false)
    erros.email = 'Informe um endereço de email válido';
  if (vazio(data.senha)) erros.senha = 'Informe uma senha';

  return {
    erros,
    validacao: Object.keys(erros).length === 0 ? true : false,
  };
};

exports.validarUsuarioDetalhes = (data) => {
  let usuarioDetalhes = {};

  if (!vazio(data.endereco.trim())) usuarioDetalhes.endereco = data.endereco;
  if (!vazio(data.cidade.trim())) usuarioDetalhes.cidade = data.cidade;
  if (!vazio(data.telefone.trim())) usuarioDetalhes.telefone = data.telefone;

  return usuarioDetalhes;
};
