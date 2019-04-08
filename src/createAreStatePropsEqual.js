import arrayEquals from './shallowArrayEquals';

export default function createAreStatePropsEqual(...elements) {
  return (next, prev) => {
    const keys = Object.keys(next);
    for (let i = 0; i < keys.length; i += 1) {
      const prop = keys[i];
      if (elements.indexOf(prop) >= 0) {
        if (!arrayEquals(next[prop], prev[prop])) {
          return false;
        }
      } else if (next[prop] !== prev[prop]) {
        return false;
      }
    }
    return true;
  };
}
