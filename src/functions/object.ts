export const checkSame = (a1: any, a2: any): boolean => {
  if (typeof a1 !== typeof a2) return false;
  if (typeof a1 === 'object') return checkSameObject(a1, a2);
  return a1 === a2;
};

export const checkSameObject = (obj1: any, obj2: any): boolean => {
  if (typeof obj1 !== typeof obj2) return false;
  let key1, key2;
  try {
    key1 = Object.keys(obj1);
    key2 = Object.keys(obj2);
  } catch (e) {
    return obj1 === obj2;
  }
  if (key1.length !== key2.length) return false;
  if (!key1.every((t) => key2.includes(t))) return false;
  return key1.every((t) => checkSame(obj1[t], obj2[t]));
};
