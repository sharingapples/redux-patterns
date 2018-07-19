class PartialReducer {
  constructor() {
    this.reducers = {};
    this.initialState = {};
  }

  setInitialState(part) {
    Object.assign(this.initialState, part);
  }

  add(type, partialReducer) {
    if (this.reducers[type]) {
      throw new Error(`A partial reducer of type ${type} has already been added`);
    }

    // Make sure the partialReducer is of type function
    if (typeof partialReducer !== 'function') {
      throw new Error('Partial reducer must be a function');
    }

    this.reducers[type] = partialReducer;
  }

  getReducer() {
    return (state = this.initialState, action) => {
      const partialReducer = this.reducers[action.type];
      if (!partialReducer) {
        return state;
      }

      return partialReducer(state, action.payload, action);
    };
  }
}

export default PartialReducer;
