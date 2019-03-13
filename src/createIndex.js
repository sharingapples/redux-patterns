export const Order = {
  // eslint-disable-next-line no-nested-ternary
  ASC: (a, b) => (a < b ? -1 : ((a > b) ? 1 : 0)),

  // eslint-disable-next-line no-nested-ternary
  DESC: (a, b) => (a > b ? -1 : ((a < b) ? 1 : 0)),
};

/**
 * Helper function to binary insert a new value in a sorted
 * array
 */
function binaryInsert(left, right, array, value, comparator) {
  if (left === right) {
    array.splice(left, 0, value);
    return array;
  }

  // eslint-disable-next-line no-bitwise
  const p = (left + right) >> 1;
  const check = comparator(array[p], value);
  if (check < 0) {
    return binaryInsert(p + 1, right, array, value, comparator);
  }

  return binaryInsert(left, p, array, value, comparator);
}

/* eslint-disable no-param-reassign */
function remove(state, k, id) {
  const list = state.by[k];
  if (!list) {
    return state;
  }

  const newList = list.filter(v => v !== id);
  if (newList.length === 0) {
    delete state.by[k];
    state.all = state.all.filter(v => v !== k);
  } else {
    state.by[k] = newList;
  }

  return state;
}

function append(state, k, id, comparator) {
  const list = state.by[k];
  if (!list) {
    state.by[k] = [id];
    if (comparator) {
      state.all = binaryInsert(0, state.all.length, state.all.slice(), k, comparator);
    } else {
      state.all = state.all.concat(k);
    }
  } else {
    state.by[k] = list.concat(id);
  }
  return state;
}
/* eslint-enable no-param-reassign */

export default function createIndex(name, extractor, comparator) {
  const key = name;
  const getValue = extractor || (record => record[name]);

  return {
    key,
    getValue,

    // Retrieve all ids for the given index value
    allIds: (state, value) => state[key].by[value],

    // Retrieve all unique index values
    values: state => state[key].all,

    // Support working on the just the indexed part of the schema
    index: state => state[key],
    indexedValues: index => index.all,
    indexedIds: (index, value) => index.by[value],

    populate: (records) => {
      const indexed = {
        all: [],
        by: {},
      };

      records.forEach((record) => {
        const k = getValue(record);
        const list = indexed.by[k];
        if (list) {
          list.push(record.id);
        } else {
          indexed.all.push(k);
          indexed.by[k] = [record.id];
        }
      });

      if (comparator) {
        indexed.all.sort(comparator);
      }

      return indexed;
    },

    insert: (state, record) => {
      const k = getValue(record);
      return append({
        by: Object.assign({}, state.by),
        all: state.all,
      }, k, record.id, comparator);
    },

    delete: (state, id, record) => {
      const k = getValue(record);
      const res = {
        by: Object.assign({}, state.by),
        all: state.all,
      };
      remove(res, k, id, comparator);
      return res;
    },

    update: (state, updates, record) => {
      const prevK = getValue(record);
      const newK = getValue(Object.assign({}, record, updates));
      if (prevK === newK) {
        return state;
      }

      const res = {
        by: Object.assign({}, state.by),
        all: state.all,
      };

      remove(res, prevK, record.id, comparator);
      append(res, newK, record.id, comparator);

      return res;
    },

    replace: (state, replacement, record) => {
      const newK = getValue(replacement);
      const res = {
        by: Object.assign({}, state.by),
        all: state.all,
      };

      if (!record) {
        // It's an insert
        return append(res, newK, replacement.id, comparator);
      }

      const prevK = getValue(record);
      if (prevK === newK) {
        return state;
      }

      remove(res, prevK, record.id, comparator);
      return append(res, newK, replacement.id, comparator);
    },
  };
}
