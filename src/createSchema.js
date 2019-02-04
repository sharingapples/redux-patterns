import {
  create, concat, remove, update, replace,
} from './normalized';

const INSERT = 'insert';
const DELETE = 'delete';
const UPDATE = 'update';
const REPLACE = 'replace';
const POPULATE = 'populate';

export default function createSchema(name) {
  return {
    populate: records => ({ type: POPULATE, schema: name, payload: records }),
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
          case POPULATE:
            return create(action.payload);

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
            return replace(state, action.payload);

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
