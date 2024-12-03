import React, { Component } from 'react';
import { format } from 'date-fns';

import Rating from '../Rate';
import './film-info.css';
import { GenresConsumer } from '../genres-context/genres-context';
import TmdbService from '../../services';

export default class FilmInfo extends Component {
  id = 100;
  tmdbService = new TmdbService();

  rateFilm = (value) => {
    const { id, sessionId } = this.props;
    localStorage.setItem(id, value);
    this.tmdbService.rateFilm(id, value, sessionId);
  };

  makeGenresList = (genres) =>
    genres.map((item) => (
      <span key={this.id++} className="genres-box">
        {item}
      </span>
    ));

  formatTime = (date) => (date ? format(new Date(date), 'MMM dd, yyyy') : null);

  getVoteClass = (voteAverage) => {
    if (voteAverage === 0) return '';
    if (voteAverage <= 3) return 'low';
    if (voteAverage <= 5) return 'low-middle';
    if (voteAverage <= 7) return 'middle';
    return 'high';
  };

  renderGenres = (genresId, genres) => {
    if (!Array.isArray(genres)) return null;

    const genreNames = genresId.map((itemId) => genres.find((genre) => genre.id === itemId)?.name).filter(Boolean);

    return <div className="genres">{this.makeGenresList(genreNames)}</div>;
  };

  renderPoster = (posterPath) =>
    posterPath ? (
      <img alt="movie" className="movie" src={`https://image.tmdb.org/t/p/w500/${posterPath}`} />
    ) : (
      <div className="no-poster">Обложка не найдена</div>
    );

  render() {
    const { id, name, description, posterPath, vote_average, genresId, date } = this.props;
    const voteFixed = vote_average.toFixed(1);
    const voteClass = 'vote-average ' + this.getVoteClass(vote_average);

    return (
      <div key={id} className="card">
        {this.renderPoster(posterPath)}
        <div className="main-info">
          <div className="header-info">
            <h5 className="header">{name}</h5>
            <div className={voteClass}>{voteFixed}</div>
          </div>
          <div className="date">{this.formatTime(date)}</div>
          <GenresConsumer>{(genres) => this.renderGenres(genresId, genres)}</GenresConsumer>
          <p className="description">{description}</p>
          <div className={`rating ${vote_average === 0 ? 'display-none' : ''}`}>
            <Rating id={id} rateFilm={this.rateFilm} />
          </div>
        </div>
      </div>
    );
  }
}
