import { createSchema, createIndex } from '../src';

describe('createIndex specification', () => {
  it('checks for CRUD operations for index feature', () => {
    const schema = createSchema('scheme');
    const index = createIndex('departmentId', 'positionId');
    const initalValue = {
      id: 1,
      name: 'John Doe',
      departmentId: 3,
      positionId: 2,
    };
    const reducer = schema.reducer([], [index]);

    // insert
    let state = reducer(undefined, schema.insert(initalValue));
    const firstIndex = index.allIds(state, { departmentId: 3, positionId: 2 });
    expect(firstIndex[0]).toEqual(1);

    // replace
    state = reducer(state, schema.replace({ id: 1, name: 'jane D' }));
    const replacedIndex = index.allIds(state, { departmentId: null, positionId: null });
    expect(replacedIndex[0]).toEqual(1);


    // update
    state = reducer(state, schema.update({
      id: 1, name: 'Lore Epsum', departmentId: 2, positionId: 6,
    }));

    const updatedIndex = index.allIds(state, { departmentId: 2, positionId: 6 });
    expect(updatedIndex[0]).toEqual(1);


    // delete
    state = reducer(state, schema.delete(1));
    const deletedIndex = index.allIds(state, { departmentId: null, positionId: null });
    expect(deletedIndex.length).toEqual(0);
  });
});
