import { createSchema, normalized } from '../src';

describe('createSchema specification', () => {
  it('checks for basic usage', () => {
    const schema = createSchema('scheme');
    const reducer = schema.reducer([]);
    let state = reducer(undefined, schema.insert({ id: 1, name: 'John Doe' }));
    expect(normalized.all(state)).toEqual([{ id: 1, name: 'John Doe' }]);
    state = reducer(state, schema.insert({ id: 2, name: 'Jane Doe' }));
    state = reducer(state, schema.insert({ id: 3, name: 'J Doe' }));
    expect(normalized.all(state)).toEqual([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
      { id: 3, name: 'J Doe' },
    ]);

    state = reducer(state, schema.update({ id: 2, type: 'F' }));
    expect(normalized.all(state)).toEqual([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe', type: 'F' },
      { id: 3, name: 'J Doe' },
    ]);

    state = reducer(state, schema.replace({ id: 2, name: 'jane D' }));
    expect(normalized.all(state)).toEqual([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'jane D' },
      { id: 3, name: 'J Doe' },
    ]);

    state = reducer(state, schema.delete(2));
    expect(normalized.all(state)).toEqual([
      { id: 1, name: 'John Doe' },
      { id: 3, name: 'J Doe' },
    ]);
  });
});
