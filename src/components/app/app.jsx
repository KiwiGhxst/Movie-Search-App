import React, { Component } from 'react';
import { Tabs } from 'antd';

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

    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
      const sessionResponse = await this.tmdbService.createGuestSession();
      sessionId = sessionResponse.guest_session_id;
      localStorage.setItem('guestSessionId', sessionId);
    }
    const genresResponse = await this.tmdbService.getGenres();

    this.setState({
      sessionId: sessionId,
      genres: genresResponse,
    });

    await this.setTabData(this.state.searchText);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);
  }

  componentDidUpdate(prevProps, prevState) {
    const { current, search, searchText } = this.state;

    if (current !== prevState.current) {
      search ? this.setTabData(searchText) : this.setTabRated();
    }
  }

  newSearch = (text) => {
    if (text.length > 0) {
      this.setState({
        searchText: text,
        current: 1,
      });
      this.setTabData(text);
    }
  };

  cleanData = () => {
    this.setState({
      data: [],
      loading: true,
    });
  };

  renderList = (filmList, totalPages) => {
    return filmList.forEach((item) => {
      this.setState(({ data }) => {
        return {
          data: [this.createItem(item), ...data],
          totalPages: totalPages * 10,
        };
      });
    });
  };

  createItem(info) {
    const { release_date: date, overview: description, id } = info;
    return {
      name: info.title,
      date: date?.replace(/-/g, ',') || 'Unknown date',
      genresId: info.genre_ids,
      description: description || 'Description not found',
      posterPath: info.poster_path,
      id,
      vote_average: info.vote_average,
      rate: info.rating || 0,
    };
  }

  onChange = (key) => {
    const isRatedTab = key === '2';

    this.setState(
      {
        search: !isRatedTab,
        current: 1,
      },
      async () => {
        if (isRatedTab) {
          await this.setTabRated();
        } else {
          await this.setTabData(this.state.searchText); // Обновляем данные поиска
        }
      }
    );
  };
  pageChange = (page) => {
    this.setState({ current: page });
  };

  async setTabRated() {
    try {
      this.cleanData();
      const [filmList, totalPages] = await this.tmdbService.getRated(this.state.sessionId, this.state.current);

      this.renderList(filmList, totalPages);
    } catch (error) {
      if (!navigator.onLine) this.onError();
    } finally {
      this.setState({ loading: false });
    }
  }

  setTabData = async (text) => {
    try {
      this.cleanData();
      let [filmList, totalPages] = await this.tmdbService.getResource(text, this.state.current);

      this.renderList(filmList, totalPages);
    } catch (error) {
      if (!navigator.onLine) this.onError();
    } finally {
      this.setState({ loading: false });
    }
  };

  rateFilm = async (rateFimlId, value) => {
    const { sessionId, data } = this.state;

    await this.tmdbService.rateFilm(rateFimlId, value, sessionId);

    const updatedData = data.map((film) => (film.id === rateFimlId ? { ...film, rate: value } : film));
    this.setState({ data: updatedData });
  };

  render() {
    const { loading, error, totalPages, current, data, genres } = this.state;
    return (
      <GenresProvider value={genres}>
        <Tabs
          onChange={this.onChange}
          items={[
            {
              key: '1',
              label: 'Search',
              children: (
                <div className="search-or-rated">
                  <SearchField newSearch={this.newSearch} cleanData={this.cleanData} />
                  {error && <OfflineMessage />}
                  {loading ? (
                    <Spinner />
                  ) : (
                    <FilmList
                      pageChange={this.pageChange}
                      current={current}
                      total={totalPages}
                      data={data}
                      rateFilm={this.rateFilm}
                    />
                  )}
                </div>
              ),
            },
            {
              key: '2',
              label: 'Rated',
              children: (
                <>
                  {error && <OfflineMessage />}
                  {loading ? (
                    <Spinner />
                  ) : (
                    <FilmList
                      pageChange={this.pageChange}
                      current={current}
                      total={totalPages}
                      data={data}
                      rateFilm={this.rateFilm}
                    />
                  )}
                </>
              ),
            },
          ]}
        />
      </GenresProvider>
    );
  }
}
