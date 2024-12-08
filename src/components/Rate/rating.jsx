import { Rate } from 'antd';
import React, { Component } from 'react';

export default class Rating extends Component {
  render() {
    const { rateFilm, movieId, rate } = this.props;
    return <Rate value={rate} count={10} onChange={(value) => rateFilm(movieId, value)} className="stars" />;
  }
}
