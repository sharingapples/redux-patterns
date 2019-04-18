import { createSchema, createIndex, Order } from '../src';

describe('createIndex specification', () => {
  it('checks for CRUD operations for index feature', () => {
    const Appointments = createSchema('appointments');
    const appointmentDateIndex = createIndex('appointmentDate', rec => rec.date.getMonth() + 1);
    const initialValues = [
      { id: 1, date: new Date('2019-02-11'), patient: 'A' },
      { id: 2, date: new Date('2019-02-12'), patient: 'B' },
      { id: 3, date: new Date('2019-02-13'), patient: 'C' },
      { id: 4, date: new Date('2019-03-01'), patient: 'D' },
    ];

    const reducer = Appointments.reducer(initialValues, [appointmentDateIndex]);

    // Initialize the state
    let state = reducer(undefined, { type: 'INIT' });
    expect(appointmentDateIndex.values(state)).toEqual([2, 3]);
    expect(appointmentDateIndex.allIds(state, 2)).toEqual([1, 2, 3]);
    expect(appointmentDateIndex.allIds(state, 3)).toEqual([4]);

    // Check data insertion
    state = reducer(state, Appointments.insert({
      id: 5, date: new Date('2019-03-02'), patient: 'D',
    }));
    expect(appointmentDateIndex.values(state)).toEqual([2, 3]);
    expect(appointmentDateIndex.allIds(state, 2)).toEqual([1, 2, 3]);
    expect(appointmentDateIndex.allIds(state, 3)).toEqual([4, 5]);

    // Check data update
    state = reducer(state, Appointments.update({
      id: 1, date: new Date('2019-02-14'),
    }));
    expect(appointmentDateIndex.values(state)).toEqual([2, 3]);
    expect(appointmentDateIndex.allIds(state, 2)).toEqual([1, 2, 3]);
    expect(appointmentDateIndex.allIds(state, 3)).toEqual([4, 5]);

    // Check data update changing index value
    state = reducer(state, Appointments.update({
      id: 1, date: new Date('2019-03-01'),
    }));
    expect(appointmentDateIndex.values(state)).toEqual([2, 3]);
    expect(appointmentDateIndex.allIds(state, 2)).toEqual([2, 3]);
    expect(appointmentDateIndex.allIds(state, 3)).toEqual([4, 5, 1]);

    // Check data replace changing index
    state = reducer(state, Appointments.replace({
      id: 2, date: new Date('2019-03-01'), patient: 'K',
    }));
    expect(appointmentDateIndex.values(state)).toEqual([2, 3]);
    expect(appointmentDateIndex.allIds(state, 2)).toEqual([3]);
    expect(appointmentDateIndex.allIds(state, 3)).toEqual([4, 5, 1, 2]);

    // Check complete removal of index
    state = reducer(state, Appointments.delete(3));
    expect(appointmentDateIndex.values(state)).toEqual([3]);
    expect(appointmentDateIndex.allIds(state, 2)).toEqual(undefined);
    expect(appointmentDateIndex.allIds(state, 3)).toEqual([4, 5, 1, 2]);
  });

  it('check order feature', () => {
    const Appointments = createSchema('appointments');
    const appointmentDateIndex = createIndex('appointmentDate', rec => rec.date.getMonth() + 1, Order.DESC);
    const initialValues = [
      { id: 1, date: new Date('2019-02-11'), patient: 'A' },
      { id: 2, date: new Date('2019-02-12'), patient: 'B' },
      { id: 3, date: new Date('2019-02-13'), patient: 'C' },
      { id: 4, date: new Date('2019-03-01'), patient: 'D' },
    ];

    const reducer = Appointments.reducer(initialValues, [appointmentDateIndex]);

    // Initialize the state
    let state = reducer(undefined, { type: 'INIT' });
    expect(appointmentDateIndex.values(state)).toEqual([3, 2]);

    // append some more data
    state = reducer(state, Appointments.insert({
      id: 5, date: new Date('2019-05-02'), patient: 'K',
    }));
    expect(appointmentDateIndex.values(state)).toEqual([5, 3, 2]);

    // append something that goes at the end
    state = reducer(state, Appointments.insert({
      id: 5, date: new Date('2019-01-02'), patient: 'K',
    }));
    expect(appointmentDateIndex.values(state)).toEqual([5, 3, 2, 1]);

    // append something that goes in the middle
    state = reducer(state, Appointments.insert({
      id: 5, date: new Date('2019-04-02'), patient: 'K',
    }));
    const values = appointmentDateIndex.values(state);
    expect(values).toEqual([5, 4, 3, 2, 1]);

    // append something that doesn't change anything
    state = reducer(state, Appointments.insert({
      id: 5, date: new Date('2019-04-05'), patient: 'K',
    }));
    expect(appointmentDateIndex.values(state)).toBe(values);
  });
});
