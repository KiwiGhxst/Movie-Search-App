import React, { Component } from 'react';
import { Pagination, Tabs } from 'antd';

import FilmList from '../film-list';
import { GenresProvider } from '../genres-context/genres-context';
import './app.css';
import TmdbService from '../../services';
import Spinner from '../spinner';
import OfflineMessage from '../error-alert';
import SearchField from '../search-field';

export default class App extends Component {
  state = {
    data: [],
    genres: '',
    loading: true,
    error: false,
    totalPages: 50,
    sessionId: null,
    searchText: 'Sherlock Holmes',
    current: 1,
    search: true,
  };

  tmdbService = new TmdbService();

  handleOnlineStatus = () => {
    this.setState({ error: !navigator.onLine });
  };

  async componentDidMount() {
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);
    try {
      localStorage.clear();

      const [sessionResponse, genresResponse] = await Promise.all([
        this.tmdbService.createGuestSession(),
        this.tmdbService.getGenres(),
      ]);

      this.setState({
        sessionId: sessionResponse.guest_session_id,
        genres: genresResponse,
      });

      await this.setData(this.state.searchText);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);
  }

  componentDidUpdate(prevProps, prevState) {
    const { current, search } = this.state;

    if (current !== prevState.current) {
      search ? this.setData() : this.setRatedData();
    }
  }

  newSearch = (text) => {
    if (text.length > 0) {
      this.setState({
        searchText: text,
        current: 1,
      });
      this.setData(text);
    }
  };

  cleanData = () => {
    this.setState({
      data: [],
      loading: true,
    });
  };

  renderList = (res, text = 'Sherlock Holmes') => {
    let [filmList, totalPages] = res;
    return filmList.forEach((item) => {
      this.setState(({ data }) => {
        return {
          data: [this.createItem(item), ...data],
          totalPages: totalPages * 10,
          searchText: text,
        };
      });
    });
  };

  async setRatedData() {
    try {
      this.cleanData();
      const res = await this.tmdbService.getRated(this.state.sessionId, this.state.current);
      this.renderList(res);
    } catch (error) {
      if (!navigator.onLine) this.onError();
    } finally {
      this.setState({ loading: false });
    }
  }

  async setData(text = this.state.searchText) {
    try {
      this.cleanData();
      const res = await this.tmdbService.getResource(text, this.state.current);
      this.renderList(res, text);
    } catch (error) {
      if (!navigator.onLine) this.onError();
    } finally {
      this.setState({ loading: false });
    }
  }

  createItem(info) {
    const {
      title: name,
      release_date: date,
      genre_ids: genresId,
      overview: description,
      poster_path: posterPath,
      id,
      vote_average,
    } = info;

    return {
      name,
      date: date?.replace(/-/g, ',') || 'Unknown date',
      genresId,
      description: description || 'Description not found',
      posterPath,
      id,
      vote_average,
      rate: 0,
    };
  }

  onChange = (key) => {
    const isRatedTab = key === '2';

    this.setState(
      {
        search: !isRatedTab,
        current: 1,
      },
      isRatedTab ? this.setRatedData : this.setData
    );
  };

  render() {
    const { loading, error, totalPages, current, sessionId, data, genres } = this.state;

    const pagination = (
      <Pagination
        onChange={(page) => this.setState({ current: page })}
        current={current}
        total={totalPages}
        defaultCurrent={1}
      />
    );

    const filmList = loading ? <Spinner /> : <FilmList pagination={pagination} sessionId={sessionId} data={data} />;
    const errorMessage = error && <OfflineMessage />;

    const tabItems = [
      {
        key: '1',
        label: 'Search',
        children: (
          <div className="search-or-rated">
            <SearchField newSearch={this.newSearch} cleanData={this.cleanData} />
            {errorMessage}
            {filmList}
          </div>
        ),
      },
      {
        key: '2',
        label: 'Rated',
        children: (
          <>
            {errorMessage}
            {filmList}
          </>
        ),
      },
    ];

    return (
      <GenresProvider value={genres}>
        <Tabs onChange={this.onChange} items={tabItems} />
      </GenresProvider>
    );
  }
}
