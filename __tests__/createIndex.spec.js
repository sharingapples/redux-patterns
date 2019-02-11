import { createSchema, createIndex } from '../src';

describe('createIndex specification', () => {
  it('checks for CRUD operations for index feature', () => {
    const schema = createSchema('scheme');
    const index = createIndex('departmentId', 'positionId');
    const uniqueIndex = createIndex('positionId');
    const initalValue = [
      {
        id: 1, name: 'something', departmentId: 3, positionId: 2,
      },
      {
        id: 2, name: 'something', departmentId: 3, positionId: 2,
      },
      {
        id: 3, name: 'something', departmentId: 3, positionId: 2,
      },
      {
        id: 4, name: 'something', departmentId: 3, positionId: 2,
      },
      {
        id: 5, name: 'something', departmentId: 3, positionId: 2,
      },
    ];
    // initial value
    const reducer = schema.reducer(initalValue, [index, uniqueIndex]);
    let state = reducer(undefined, schema);

    const initalIndexes = index.allIds(state, { departmentId: 3, positionId: 2 });
    expect(initalIndexes.length).toEqual(5);

    const newValue = {
      id: 6,
      name: 'John Doe',
      departmentId: 3,
      positionId: 5,
    };

    // insert
    state = reducer(undefined, schema.insert(newValue));
    const firstIndex = index.allIds(state, { departmentId: 3, positionId: 5 });
    expect(firstIndex[0]).toEqual(6);

    // replace
    state = reducer(state, schema.replace({ id: 6, name: 'jane D' }));
    const replacedIndex = index.allIds(state, { departmentId: null, positionId: null });
    expect(replacedIndex[0]).toEqual(6);


    // update
    state = reducer(state, schema.update({
      id: 6, name: 'Lore Epsum', departmentId: 2, positionId: 6,
    }));

    const updatedIndex = index.allIds(state, { departmentId: 2, positionId: 6 });
    expect(updatedIndex[0]).toEqual(6);

    // unique
    const unique = uniqueIndex.unique(state, 'DESC');
    expect(unique).toEqual(['6', '5', '2', 'undefined']);

    expect(index.unique(state, 'ASC')).toEqual(['2:6', '3:2', '3:5', ':']);

    // delete
    state = reducer(state, schema.delete(6));
    const deletedIndex = index.allIds(state, { departmentId: null, positionId: null });
    expect(deletedIndex.length).toEqual(0);
  });
});
