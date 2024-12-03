import React, { Component } from 'react';
import './search-field.css';
import _ from 'lodash';

export default class SearchField extends Component {
  state = {
    label: '',
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.label !== prevState.label && this.state.label !== '') {
      this.props.cleanData();
      this.props.newSearch(this.state.label);
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.setState({
      label: '',
    });
  };

  search = _.debounce((e) => {
    this.setState({
      label: e.target.value,
    });
  }, 1000);

  render() {
    return (
      <search>
        <form className="search-form" onSubmit={this.onSubmit}>
          <input
            name="search"
            type="text"
            className="search"
            placeholder="Type to search..."
            onChange={(e) => this.search(e)}
          />
        </form>
      </search>
    );
  }
}
