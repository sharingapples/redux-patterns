import { createSchema, normalized } from '../src';


describe('createSchema specification', () => {
  const schema = createSchema('schema');
  const reducer = schema.reducer([]);

  let state = reducer(undefined, schema.insert({ id: 1, name: 'Javascript' }));
  state = reducer(state, schema.insert({ id: 2, name: 'Ruby' }));
  state = reducer(state, schema.insert({ id: 3, name: 'Python' }));


  it('inserts records into schema', () => {
    expect(normalized.all(state)).toEqual([
      { id: 1, name: 'Javascript' },
      { id: 2, name: 'Ruby' },
      { id: 3, name: 'Python' },
    ]);
  });


  it('updates a record of schema', () => {
    state = reducer(state, schema.update({ id: 2, name: 'Rust', createdBy: 'Mozilla' }));
    expect(normalized.all(state)).toEqual([
      { id: 1, name: 'Javascript' },
      { id: 2, name: 'Rust', createdBy: 'Mozilla' },
      { id: 3, name: 'Python' },
    ]);
  });

  it('replaces a record of schema', () => {
    state = reducer(state, schema.replace({ id: 3, name: 'Go', createdBy: 'Google' }));
    expect(normalized.all(state)).toEqual([
      { id: 1, name: 'Javascript' },
      { id: 2, name: 'Rust', createdBy: 'Mozilla' },
      { id: 3, name: 'Go', createdBy: 'Google' },
    ]);
  });

  it('deletes a record of schema', () => {
    state = reducer(state, schema.delete(2));
    expect(normalized.all(state)).toEqual([
      { id: 1, name: 'Javascript' },
      { id: 3, name: 'Go', createdBy: 'Google' },
    ]);
  });

  it('upserts [inserts] a record of schema', () => {
    state = reducer(state, schema.upsert({ id: 2, name: 'Rust', createdBy: 'Mozilla' }));
    expect(normalized.all(state)).toEqual([
      { id: 1, name: 'Javascript' },
      { id: 3, name: 'Go', createdBy: 'Google' },
      { id: 2, name: 'Rust', createdBy: 'Mozilla' },
    ]);
  });

  it('upserts [update] a record of schema', () => {
    state = reducer(state, schema.upsert({ id: 1, name: 'JS', createdBy: 'Brendan Eich' }));
    expect(normalized.all(state)).toEqual([
      { id: 1, name: 'JS', createdBy: 'Brendan Eich' },
      { id: 3, name: 'Go', createdBy: 'Google' },
      { id: 2, name: 'Rust', createdBy: 'Mozilla' },
    ]);
  });
});
