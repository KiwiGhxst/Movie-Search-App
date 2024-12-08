import React, { Component } from 'react';
import { format } from 'date-fns';

import Rating from '../Rate';
import './film-info.css';
import { GenresConsumer } from '../genres-context/genres-context';

export default class FilmInfo extends Component {
  formatTime = (date) => {
    if (!date) return null;
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return null;
    return format(parsedDate, 'MMM dd, yyyy');
  };

  getVoteClass = (voteAverage) => {
    if (voteAverage === 0) return '';
    if (voteAverage <= 3) return 'low';
    if (voteAverage <= 5) return 'low-middle';
    if (voteAverage <= 7) return 'middle';
    return 'high';
  };

  render() {
    const { movieId, name, description, posterPath, vote_average, date, genresId, rateFilm, rate } = this.props;
    const voteFixed = vote_average.toFixed(1);

    return (
      <div className="card">
        {posterPath ? (
          <img alt="movie" className="movie" src={`https://image.tmdb.org/t/p/w500/${posterPath}`} />
        ) : (
          <div className="no-poster">Обложка не найдена</div>
        )}
        <div className="main-info">
          <div className="header-info">
            <span className="header">{name}</span>
            <div className={'vote-average ' + this.getVoteClass(vote_average)}>{voteFixed}</div>
          </div>
          <div className="date">{this.formatTime(date)}</div>
          <GenresConsumer>
            {(genres) => {
              if (!Array.isArray(genres)) return null;
              return (
                <div className="genres">
                  {genresId?.map((itemId) =>
                    genres?.map((genre) => {
                      if (genre.id === itemId) {
                        return (
                          <span key={genre.id} className="genres-box">
                            {genre.name}
                          </span>
                        );
                      }
                    })
                  )}
                </div>
              );
            }}
          </GenresConsumer>
          <p className="description">{description}</p>
          <div className="rating">
            <Rating movieId={movieId} rateFilm={rateFilm} rate={rate} />
          </div>
        </div>
      </div>
    );
  }
}
