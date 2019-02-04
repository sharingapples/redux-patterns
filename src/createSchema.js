import {
  create, concat, remove, update,
} from './normalized';

const INSERT = 'insert';
const DELETE = 'delete';
const UPDATE = 'update';
const REPLACE = 'replace';

export default function createSchema(name) {
  return {
    insert: record => ({ type: INSERT, schema: name, payload: record }),
    delete: id => ({ type: DELETE, schema: name, payload: id }),
    update: record => ({ type: UPDATE, schema: name, payload: record }),
    replace: record => ({ type: REPLACE, schema: name, payload: record }),

    reducer: (initial, extension) => {
      const initialState = create(initial);
      return (state = initialState, action) => {
        if (action.schema !== name) {
          return state;
        }

        switch (action.type) {
          case INSERT:
            return concat(state, action.payload);

          case DELETE:
            return remove(state, action.payload);

          case UPDATE:
            return update(state, action.payload.id, record => ({
              ...record,
              ...action.payload,
            }));

          case REPLACE:
            return update(state, action.payload.id, () => action.payload);

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
