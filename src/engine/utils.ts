export const deepFreeze = (objectToFreeze: any = {}, uuid?: string) => {
  if (objectToFreeze instanceof Array) {
    objectToFreeze.forEach((item) => deepFreeze(item, uuid));
  } else {
    Object.keys(objectToFreeze).forEach((prop) => {
      if (typeof objectToFreeze[prop] === 'object' && !Object.isFrozen(objectToFreeze[prop]))
        deepFreeze(objectToFreeze[prop], uuid);
    });
  }

  return Object.freeze(objectToFreeze);
};
