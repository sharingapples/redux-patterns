import {
  create, concat, remove, update, replace,
} from './normalized';

const INSERT = 'db.insert';
const DELETE = 'db.delete';
const UPDATE = 'db.update';
const REPLACE = 'db.replace';
const POPULATE = 'db.populate';

export default function createSchema(name) {
  return {
    populate: records => ({ type: POPULATE, schema: name, payload: records }),
    insert: record => ({ type: INSERT, schema: name, payload: record }),
    delete: id => ({ type: DELETE, schema: name, payload: id }),
    update: record => ({ type: UPDATE, schema: name, payload: record }),
    replace: record => ({ type: REPLACE, schema: name, payload: record }),

    reducer: (initial, indexes = [], extension) => {
      const initialState = create(initial);
      indexes.forEach((index) => {
        initialState[index.key] = index.populate(initial);
      });

      return (state = initialState, action) => {
        if (action.schema !== name) {
          return state;
        }

        const { type, payload } = action;

        switch (type) {
          case POPULATE:
            return indexes.reduce((res, index) => (
              index.populate(res, payload, state)
            ), create(payload));

          case INSERT:
            return indexes.reduce((res, index) => ({
              ...res,
              [index.key]: index.insert(res[index.key], payload),
            }), concat(state, payload));

          case DELETE: {
            const prev = state.byId[payload];
            return indexes.reduce((res, index) => ({
              ...res,
              [index.key]: index.delete(res[index.key], payload, prev),
            }), remove(state, payload));
          }

          case UPDATE: {
            const prev = state.byId[payload.id];
            return indexes.reduce((res, index) => ({
              ...res,
              [index.key]: index.update(res[index.key], payload, prev),
            }), update(state, payload.id, record => ({
              ...record,
              ...payload,
            })));
          }

          case REPLACE: {
            const prev = state.byId[payload.id];
            return indexes.reduce((res, index) => ({
              ...res,
              [index.key]: index.replace(res[index.key], payload, prev),
            }), replace(state, payload));
          }

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
