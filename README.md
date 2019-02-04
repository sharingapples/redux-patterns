# redux-patterns
* PartialReducer
* observer
  - observeStore
  - observe Component

## Schema
```javascript
import { createSchema } from 'redux-patterns'

const user = createSchema('user');

// Create specific reducers
const reducer = combineReducers({
  user: user.reducer([{ id: 0, name: 'Zero' }]), // Initialize with initial records
});

// Schema specific actions
store.dispatch(user.insert({ id: 1, name: 'john' }));
store.dispatch(user.delete(1));
store.dispatch(user.update({ id: 1, name: 'jane', type: 'admin' }));
store.dispatch(user.replace({ id: 1, name: 'smith' }));
```

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

const observation = (month, { dispatch, setProps }) => {
  // clear the appointments
  // dispatch(clearAppointments());
  setProps({ appointments: null });

  // Make an api call to get all the appointments
  const appointments = await api.getAppointments(month);

  // Update the appointments
  // dispatch(setAppointments(appointments));
  setProps({ appointments });
};

const getMonth = state => `${state.year}-${state.month}`;

export connect(mapStateToProps)(observe(observation, getMonth)(DisplayPage));
```