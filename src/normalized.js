// @flow
export type Entity = {
  id: string,
};

export type NormalizedState<T: Entity> = {
  allIds: Array<string>,
  byId: {
    [string]: T,
  },
};

export type UpdateFn<T: Entity> = (T, number, Array<string>) => any;
export type ReduceFn<T: Entity> = (any, T, number, Array<string>) => any;
export type FilterFn<T: Entity> = (T, number, Array<T>) => any;

export function get<T: Entity>(state: NormalizedState<T>, id: string): T {
  return state.byId[id];
}

export function allIds(state: NormalizedState<*>): Array<string> {
  return state.allIds;
}

export function getAt<T: Entity>(state: NormalizedState<T>, index: number): T {
  return state.byId[state.allIds[index]];
}

export function getAtTurn<T: Entity>(state: NormalizedState<T>, turn: number): T {
  return getAt(state, turn % state.allIds.length);
}

export function length<T: Entity>(state: NormalizedState<T>): number {
  return state.allIds.length;
}

export function create<T: Entity>(items: Array<T>, initial?: Object) {
  return {
    allIds: items.map(item => item.id),
    byId: items.reduce((res, item) => ({
      ...res,
      [item.id]: {
        ...initial,
        ...item,
      },
    }), {}),
  };
}

export function concat<T: Entity>(state: NormalizedState<T>, item: T) {
  return {
    ...state,
    allIds: state.allIds.concat(item.id),
    byId: {
      ...state.byId,
      [item.id]: item,
    },
  };
}

export function update<T: Entity>(
  state: NormalizedState<T>,
  updateId: string,
  updater: UpdateFn<T>
) {
  const src = state.byId[updateId];
  const modified = updater(src);
  if (src === modified) {
    return state;
  }

  return {
    ...state,
    byId: state.allIds.reduce((res, id) => ({
      ...res,
      [id]: id !== updateId ? state.byId[id] : modified,
    }), {}),
  };
}

export function replace<T: Entity>(state: NormalizedState<T>, record) {
  const byId = Object.assign({}, state.byId);
  byId[record.id] = record;

  if (!state.byId[record.id]) {
    return {
      ...state,
      allIds: state.allIds.concat(record.id),
      byId,
    };
  }

  return {
    ...state,
    byId,
  };
}

export function upsert<T: Entity>(state: NormalizedState<T>, record) {
  const recordInTheState = Boolean(state.byId[record.id]);

  if (recordInTheState) {
    // update the record in the state.
    return {
      ...state,
      byId: {
        ...state.byId,
        [record.id]: {
          ...state.byId[record.id],
          ...record,
        },
      },
    };
  }

  // insert the record in the state
  return {
    ...state,
    allIds: state.allIds.concat(record.id),
    byId: {
      ...state.byId,
      [record.id]: record,
    },
  };
}

export function remove<T: Entity>(
  state: NormalizedState<T>,
  id: string
) {
  // First make sure the record is in the state
  if (!state.byId[id]) {
    return state;
  }

  // Create a copy, its much easier
  const copy = Object.assign({}, state.byId);
  delete copy[id];
  return {
    ...state,
    allIds: state.allIds.filter(i => i !== id),
    byId: copy,
  };
}

export function updateAt<T: Entity>(
  state: NormalizedState<T>,
  idx: number,
  updater: UpdateFn<T>
) {
  return {
    ...state,
    byId: state.allIds.reduce((res, id, i, src) => ({
      ...res,
      [id]: idx !== i ? state.byId[id] : updater(state.byId[id], i, src),
    }), {}),
  };
}

export function updateAtTurn<T: Entity>(
  state: NormalizedState<T>,
  turn: number,
  updater: UpdateFn<T>
) {
  return updateAt(state, turn % state.allIds.length, updater);
}

export function updateAll<T: Entity>(state: NormalizedState<T>, updater: UpdateFn<T>) {
  return {
    ...state,
    byId: state.allIds.reduce((res, id, idx, src) => ({
      ...res,
      [id]: updater(state.byId[id], idx, src),
    }), {}),
  };
}

export function all<T: Entity>(state: NormalizedState<T>) {
  return state.allIds.map(id => state.byId[id]);
}

export function forEach<T: Entity>(state: NormalizedState<T>, fn: UpdateFn<T>) {
  state.allIds.forEach((id, idx, src) => fn(state.byId[id], idx, src));
}

export function map<T: Entity>(state: NormalizedState<T>, fn: UpdateFn<T>) {
  return state.allIds.map((id, idx, src) => fn(state.byId[id], idx, src));
}

export function filter<T: Entity>(state: NormalizedState<T>, fn: FilterFn<T>) {
  return state.allIds.filter((id, idx, src) => fn(state.byId[id], idx, src));
}

export function reduce<T: Entity>(state: NormalizedState<T>, fn: ReduceFn<T>, initial) {
  return state.allIds.reduce((res, id, idx, src) => fn(res, state.byId[id], idx, src), initial);
}

export type TruthyFn<T: Entity> = (T, number, Array<string>) => boolean;

export function count<T: Entity>(state: NormalizedState<T>, fn: TruthyFn<T>) {
  return state.allIds.reduce((res, id, idx, src) => (
    fn(state.byId[id], idx, src) ? res + 1 : res
  ), 0);
}
