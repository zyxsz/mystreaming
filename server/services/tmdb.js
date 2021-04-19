const api = require('./api');

const searchTvShow = async (name) =>
  api
    .get('/search/tv', { params: { query: name } })
    .then((res) => res.data.results)
    .catch(() => false);

const getTvShowInfos = async (id) =>
  api
    .get(`/tv/${id}`)
    .then((res) => res.data)
    .catch(() => false);

const getTvShowTrailers = async (id) =>
  api
    .get(`tv/${id}/videos`, { params: { language: 'en-US' } })
    .then(
      (res) => res.data.results.filter((result) => result.site === 'YouTube')[0]
    )
    .catch(() => false);

const getTvShowImages = async (id) =>
  api
    .get(`tv/${id}/images`, { params: { language: 'en' } })
    .then((res) => res.data)
    .catch(() => false);

module.exports = {
  searchTvShow,
  getTvShowInfos,
  getTvShowTrailers,
  getTvShowImages,
};
