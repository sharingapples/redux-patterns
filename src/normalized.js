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

export function get<T:Entity>(state: NormalizedState<T>, id: string): T {
  return state.byId[id];
}

export function getAt<T: Entity>(state: NormalizedState<T>, index: number): T {
  return state.byId[state.allIds[index]];
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
  return {
    allIds: state.allIds,
    byId: state.allIds.reduce((res, id, idx, src) => ({
      ...res,
      [id]: id !== updateId ? state.byId[id] : updater(state.byId[id], idx, src),
    }), {}),
  };
}

export function updateAt<T: Entity>(
  state: NormalizedState<T>,
  idx: number,
  updater: UpdateFn<T>
) {
  return {
    allIds: state.allIds,
    byId: state.allIds.reduce((res, id, i, src) => ({
      ...res,
      [id]: idx !== i ? state.byId[id] : updater(state.byId[id], i, src),
    }), {}),
  };
}

export function updateAll<T: Entity>(state: NormalizedState<T>, updater: UpdateFn<T>) {
  return {
    allIds: state.allIds,
    byId: state.allIds.reduce((res, id, idx, src) => ({
      ...res,
      [id]: updater(state.byId[id], idx, src),
    }), {}),
  };
}

export function map<T: Entity>(state: NormalizedState<T>, fn: UpdateFn<T>) {
  return state.allIds.map((id, idx, src) => fn(state.byId[id], idx, src));
}

export type TruthyFn<T: Entity> = (T, number, Array<string>) => boolean;

export function count<T: Entity>(state: NormalizedState<T>, fn: TruthyFn<T>) {
  return state.allIds.reduce((res, id, idx, src) => (
    fn(state.byId[id], idx, src) ? res + 1 : res
  ), 0);
}
