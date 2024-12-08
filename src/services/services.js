export default class TmdbService {
  _apiKey = '0abfa8af4e589424a50bcd17a7f5b6e7';
  _urlBase = 'https://api.themoviedb.org';

  async _fetchResource(endpoint, options = {}) {
    const url = new URL(endpoint, this._urlBase);
    const res = await fetch(url.toString(), options);

    if (!res.ok) throw new Error(`Could not fetch ${url}, received ${res.status}`);
    return res.json();
  }

  async getResource(searchInput, page) {
    const url = new URL('/3/search/movie', this._urlBase);
    url.search = new URLSearchParams({
      api_key: this._apiKey,
      language: 'en-US',
      query: searchInput,
      page: page,
      include_adult: false,
    }).toString();

    const data = await this._fetchResource(url.pathname + url.search);
    return this._extractData(data);
  }

  async createGuestSession() {
    const url = new URL('/3/authentication/guest_session/new', this._urlBase);
    url.search = new URLSearchParams({ api_key: this._apiKey }).toString();
    return await this._fetchResource(url.pathname + url.search);
  }

  async rateFilm(id, value, sessionId) {
    const url = new URL(`/3/movie/${id}/rating`, this._urlBase);
    url.search = new URLSearchParams({
      api_key: this._apiKey,
      guest_session_id: sessionId,
    }).toString();

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify({ value }),
    };
    return await this._fetchResource(url.pathname + url.search, options);
  }

  async getRated(sessionId, page) {
    const url = new URL(`/3/guest_session/${sessionId}/rated/movies`, this._urlBase);
    url.search = new URLSearchParams({
      api_key: this._apiKey,
      language: 'en-US',
      sort_by: 'created_at.asc',
      page: page,
    }).toString();

    const data = await this._fetchResource(url.pathname + url.search);
    return this._extractData(data);
  }

  async getGenres() {
    const url = new URL('/3/genre/movie/list', this._urlBase);
    url.search = new URLSearchParams({
      api_key: this._apiKey,
      language: 'en-US',
    }).toString();

    const { genres } = await this._fetchResource(url.pathname + url.search);
    return genres;
  }

  _extractData(dataObject) {
    return [dataObject.results, dataObject.total_pages];
  }
}
