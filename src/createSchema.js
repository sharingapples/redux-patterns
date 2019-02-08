import {
  create, concat, remove, update, replace,
} from './normalized';

const INSERT = 'insert';
const DELETE = 'delete';
const UPDATE = 'update';
const REPLACE = 'replace';
const POPULATE = 'populate';

function forUpdate(key, res, prevKey, newKey, id) {
  if (newKey === prevKey) {
    return res;
  }
  const prevList = res[key][prevKey] || [];
  const newList = res[key][newKey] || [];
  return {
    ...res,
    [key]: {
      ...res[key],
      [prevKey]: prevList.filter(l => l !== id),
      [newKey]: newList.concat(id),
    },
  };
}

export function createIndex(...fields) {
  const key = fields.length > 1 ? `:${fields.join(':')}` : `:${fields[0]}`;
  const value = fields.length > 1
    ? (record => fields.map(f => record[f]).join(':'))
    : (record => record[fields[0]]);
  return {
    key,
    value,

    populate: (res, payload) => ({
      ...res,
      [key]: payload.reduce((r, record) => {
        const k = value(record);
        if (!r[k]) {
          // eslint-disable-next-line no-param-reassign
          r[k] = [record.id];
        } else {
          r[k].push(record.id);
        }
        return r;
      }, {}),
    }),

    insert: (res, payload) => {
      const k = value(payload);
      const list = res[k] || [];

      return {
        ...res,
        [key]: {
          ...res[key],
          [k]: list.concat(payload.id),
        },
      };
    },

    delete: (res, payload, prev) => {
      const k = value(prev.byId[payload]);
      const list = res[k] || [];
      return {
        ...res,
        [key]: {
          ...res[key],
          [k]: list.filter(l => l !== payload),
        },
      };
    },

    update: (res, payload, prev) => {
      const prevRec = prev.byId[payload.id];
      return forUpdate(key, res, value(prevRec),
        value(Object.assign({}, prevRec, payload)), payload.id);
    },

    replace: (res, payload, prev) => {
      const prevRec = prev.byId[payload.id];
      return forUpdate(key, res, value(prevRec), value(payload), payload.id);
    },

    allIds: (state, ref) => {
      const indexes = state[key];
      if (!indexes) {
        return [];
      }

      const k = typeof ref === 'string' ? ref : value(ref);
      return indexes[k] || [];
    },
  };
}

export default function createSchema(name) {
  return {
    populate: records => ({ type: POPULATE, schema: name, payload: records }),
    insert: record => ({ type: INSERT, schema: name, payload: record }),
    delete: id => ({ type: DELETE, schema: name, payload: id }),
    update: record => ({ type: UPDATE, schema: name, payload: record }),
    replace: record => ({ type: REPLACE, schema: name, payload: record }),

    reducer: (initial, indexes, extension) => {
      const initialState = indexes.reduce((res, index) => (
        index.populate(res, initial)
      ), create(initial));

      return (state = initialState, action) => {
        if (action.schema !== name) {
          return state;
        }
        switch (action.type) {
          case POPULATE:
            return indexes.reduce((res, index) => (
              index.populate(res, action.payload, state)
            ), create(action.payload));

          case INSERT:
            return indexes.reduce((res, index) => (
              index.insert(res, action.payload, state)
            ), concat(state, action.payload));

          case DELETE:
            return indexes.reduce((res, index) => (
              index.delete(res, action.payload, state)
            ), remove(state, action.payload));

          case UPDATE:
            return indexes.reduce((res, index) => (
              index.update(res, action.payload, state)
            ), update(state, action.payload.id, record => ({
              ...record,
              ...action.payload,
            })));

          case REPLACE:
            return indexes.reduce((res, index) => (
              index.replace(res, action.payload, state)
            ), replace(state, action.payload));

          default:
            if (extension) {
              return extension(state, action);
            }
            return state;
        }
      };
    },
  };
}
