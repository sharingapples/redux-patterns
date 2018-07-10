// eslint-disable-next-line import/no-unresolved
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import observeStore from './observeStore';

const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired,
});

const strictEqual = (a, b) => a === b;

export default function observe(observation, select, { isEqual = strictEqual }) {
  return (Target) => {
    class Observed extends Component {
      componentDidMount() {
        const { store } = this.context;
        this.unsubsribe = observeStore(store, select, observation, isEqual);
      }

      componentWillUnmount() {
        this.unsubsribe();
      }

      render() {
        return (
          <Target {...this.props} />
        );
      }
    }

    Observed.contextTypes = {
      store: storeShape,
    };

    return Observed;
  };
}
