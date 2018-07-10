const strictEqual = (a, b) => a === b;

export default function observeStore(store, select, onChange, isEqual = strictEqual) {
  let prevState;

  function handleChange() {
    const currentState = select(store.getState());
    if (!isEqual(currentState, prevState)) {
      prevState = currentState;
      onChange(currentState, store.dispatch);
    }
  }

  const unsubscribe = store.subscribe(handleChange);

  // Invoke change the first time
  handleChange();

  return unsubscribe;
}
