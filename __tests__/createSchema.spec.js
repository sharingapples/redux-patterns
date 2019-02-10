import { createSchema, normalized, createIndex } from '../src';

describe('createSchema specification', () => {
  it('checks for basic usage', () => {
    const schema = createSchema('scheme');
    const index = createIndex('departmentId', 'positionId');
    const initalValue = {
      id: 1,
      name: 'John Doe',
      departmentId: 3,
      positionId: 2,
    };
    const reducer = schema.reducer([initalValue], [index]);


    let state = reducer(undefined, schema.insert({
      id: 2, name: 'Lore Epsum', departmentId: 3, positionId: 5,
    }));

    expect(normalized.all(state)).toEqual([
      initalValue,
      {
        id: 2, name: 'Lore Epsum', departmentId: 3, positionId: 5,
      },
    ]);

    const firstIndex = index.allIds(state, '3:2');
    expect(firstIndex[0]).toEqual(1);

    const secondIndex = index.allIds(state, '3:5');
    expect(secondIndex[0]).toEqual(2);

    const johnDoe = normalized.get(state, initalValue.id);
    expect(index.value(johnDoe)).toEqual(`${initalValue.departmentId}:${initalValue.positionId}`);

    // insert
    state = reducer(state, schema.insert({
      id: 3, name: 'Jane Doe', departmentId: 3, positionId: 8,
    }));
    state = reducer(state, schema.insert({ id: 4, name: 'J Doe' }));

    expect(normalized.all(state)).toEqual([
      initalValue,
      {
        id: 2, name: 'Lore Epsum', departmentId: 3, positionId: 5,
      },
      {
        id: 3, name: 'Jane Doe', departmentId: 3, positionId: 8,
      },
      { id: 4, name: 'J Doe' },
    ]);


    // update
    state = reducer(state, schema.update({
      id: 2, name: 'Lore Epsum', departmentId: 2, positionId: 6,
    }));
    expect(normalized.all(state)).toEqual([
      initalValue,
      {
        id: 2, name: 'Lore Epsum', departmentId: 2, positionId: 6,
      },
      {
        id: 3, name: 'Jane Doe', departmentId: 3, positionId: 8,
      },
      { id: 4, name: 'J Doe' },
    ]);

    const loreEpsum = normalized.get(state, 2);
    expect(index.value(loreEpsum)).toEqual('2:6');

    const updatedIndex = index.allIds(state, '2:6');
    expect(updatedIndex[0]).toEqual(2);

    // replace
    state = reducer(state, schema.replace({ id: 3, name: 'jane D' }));
    expect(normalized.all(state)).toEqual([
      initalValue,
      {
        id: 2, name: 'Lore Epsum', departmentId: 2, positionId: 6,
      },
      { id: 3, name: 'jane D' },
      { id: 4, name: 'J Doe' },
    ]);

    const jane = normalized.get(state, 3);
    expect(index.value(jane)).toEqual(':');


    // delete
    state = reducer(state, schema.delete(3));
    expect(normalized.all(state)).toEqual([
      initalValue,
      {
        id: 2, name: 'Lore Epsum', departmentId: 2, positionId: 6,
      },
      { id: 4, name: 'J Doe' },
    ]);
  });
});
