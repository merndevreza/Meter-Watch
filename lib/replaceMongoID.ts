const replaceMongoIdInArray = (array) => {
  const newArray = array.map((item) => {
    const { _id, ...rest } = item;
    return {
      id: _id.toString(),
      ...rest,
    };
  });

  return newArray;
};

const replaceMongoIdInObject = (obj) => {
  const { _id, ...rest } = obj;
  return {
    id: _id.toString(),
    ...rest,
  };
};

export { replaceMongoIdInArray,replaceMongoIdInObject };
