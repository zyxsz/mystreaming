const Env = use('Env');

const axios = require('axios').default;

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: Env.get('TMDB_API_KEY'),
    language: 'pt-BR',
  },
});

module.exports = api;
