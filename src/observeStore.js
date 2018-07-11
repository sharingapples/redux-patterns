const strictEqual = (a, b) => a === b;

export default function observeStore(
  store,
  select,
  onChange,
  { isEqual = strictEqual, ...options } = {}
) {
  let prevState;

  function handleChange() {
    const currentState = select(store.getState());
    if (!isEqual(currentState, prevState)) {
      prevState = currentState;
      onChange(currentState, options);
    }
  }

  const unsubscribe = store.subscribe(handleChange);

  // Invoke change the first time
  handleChange();

  return unsubscribe;
}
