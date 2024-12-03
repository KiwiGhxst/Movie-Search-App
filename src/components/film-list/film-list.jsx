import './film-list.css';
import React, { Component } from 'react';

import FilmInfo from '../film-info';
import NoDataMessage from '../no-data-message';

export default class FilmList extends Component {
  makeFilmList = (data, sessionId) => {
    return data.map((item) => {
      const { id, ...itemProps } = item;
      return <FilmInfo sessionId={sessionId} key={id} id={id} {...itemProps} />;
    });
  };

  render() {
    const { data, sessionId, pagination } = this.props;

    const elements = this.makeFilmList(data, sessionId);

    return (
      <div className="film-list-pagination">
        {data.length > 0 ? (
          <>
            <div className="film-list">{elements}</div>
            <div className="pagination">{pagination}</div>
          </>
        ) : (
          <NoDataMessage />
        )}
      </div>
    );
  }
}
