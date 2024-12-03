export default class TmdbService {
  _apiKey = '?api_key=0abfa8af4e589424a50bcd17a7f5b6e7';
  _urlBase = 'https://api.themoviedb.org/3';

  async _fetchResource(endpoint, options = {}) {
    const url = `${this._urlBase}${endpoint}`;
    const res = await fetch(url, options);

    if (!res.ok) throw new Error(`Could not fetch ${url}, received ${res.status}`);
    return await res.json();
  }

  async getResource(searchInput, page) {
    const endpoint = `/search/movie${this._apiKey}&language=en-US&query=${searchInput}&page=${page}&include_adult=false`;
    const data = await this._fetchResource(endpoint);
    return this._extractData(data);
  }

  async createGuestSession() {
    const endpoint = `/authentication/guest_session/new${this._apiKey}`;
    return await this._fetchResource(endpoint);
  }

  async rateFilm(id, value, sessionId) {
    const endpoint = `/movie/${id}/rating${this._apiKey}&guest_session_id=${sessionId}`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify({ value }),
    };
    return await this._fetchResource(endpoint, options);
  }

  async getRated(sessionId, page) {
    const endpoint = `/guest_session/${sessionId}/rated/movies${this._apiKey}&language=en-US&sort_by=created_at.asc&page=${page}`;
    const data = await this._fetchResource(endpoint);
    return this._extractData(data);
  }

  async getGenres() {
    const endpoint = `/genre/movie/list${this._apiKey}&language=en-US`;
    const { genres } = await this._fetchResource(endpoint);
    return genres;
  }

  _extractData(dataObject) {
    return [dataObject.results, dataObject.total_pages];
  }
}
