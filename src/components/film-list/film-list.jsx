import './film-list.css';
import React, { Component } from 'react';
import { Pagination } from 'antd';

import FilmInfo from '../film-info';
import NoDataMessage from '../no-data-message';

export default class FilmList extends Component {
  render() {
    const { data, current, total, pageChange, rateFilm } = this.props;
    return (
      <div className="film-list-pagination">
        {data.length > 0 ? (
          <>
            <div className="film-list">
              {data.map((item) => {
                const { id, ...itemProps } = item;
                return <FilmInfo rateFilm={rateFilm} key={id} movieId={id} {...itemProps} />;
              })}
            </div>
            <div className="pagination">
              <Pagination onChange={(current) => pageChange(current)} current={current} total={total} />
            </div>
          </>
        ) : (
          <NoDataMessage />
        )}
      </div>
    );
  }
}
