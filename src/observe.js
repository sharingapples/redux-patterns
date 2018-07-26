// eslint-disable-next-line import/no-unresolved
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import observeStore from './observeStore';

const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired,
});

const strictEqual = (a, b) => a === b;

export default function observe(observation, select, { isEqual = strictEqual } = {}) {
  return (Target) => {
    class Observed extends PureComponent {
      state = {};

      componentDidMount() {
        const { store } = this.context;
        this.unsubsribe = observeStore(
          store,
          select,
          observation,
          {
            isEqual,
            dispatch: store.dispatch,
            setProps: this.setStateOnMounted,
          }
        );
      }

      componentWillUnmount() {
        this.unsubsribe();
        this.unsubsribe = null;
      }

      setStateOnMounted = (newState) => {
        // The unsubscibe is set only after the component is mounted
        if (this.unsubsribe) {
          return this.setState(newState);
        }

        return null;
      }

      render() {
        return (
          <Target {...this.props} {...this.state} />
        );
      }
    }

    Observed.contextTypes = {
      store: storeShape,
    };

    return Observed;
  };
}
