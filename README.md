# redux-patterns
* PartialReducer
* observer
  - observeStore
  - observe Component

## PartialReducer
A partial reducer encourages defining an action and it's
corresponding reducer effect at the same place.

```javascript
const partialReducer = new PartialReducer();

const fooAction = (partialReducer) => {
  partialReducer.add('foo', (state, { f1, f2 }) => ({
    ...state,
    foo: { f1, f2 },
  }));

  return (f1, f2) => ({
    type: 'foo',
    payload: { f1, f2 },
  });
};

const barAction = (partialReducer) => {
  partialReducer.add('bar', (state, { b1, b2 }) => ({
    ...state,
    bar: { b1, b2 },
  }));

  return (b1, b2) => ({
    type: 'bar',
    payload: { b1, b2 },
  });
};

export const actions = {
  foo: fooAction(partialReducer),
  bar: barAction(partialReducer),
};

export const reducer = partialReducer.getReducer();

```

## observe
An observe component reacts to changes on value without
any concern on how the value had changed.
```javascript
const DisplayPage = ({ appointments }) => {
  if (appointments === null) {
    return (<div>Loading...</div>);
  }

  return (
    <div>
      { appointments.map(a => <div key={a.id}>{a.title}</div>) }
    </div>
  );
}

const observation = (month, dispatch) => {
  // clear the appointments
  dispatch(clearAppointments());

  // Make an api call to get all the appointments
  const appointments = await api.getAppointments(month);

  // Update the appointments
  dispatch(setAppointments(appointments));
};

export connect(mapStateToProps)(observe(observation, getMonth)(DisplayPage));
```