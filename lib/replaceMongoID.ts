import { Types } from 'mongoose';

// Define a shape for objects coming from MongoDB
interface MongoObject {
  _id: string | Types.ObjectId;
  [key: string]: any;
}

/**
 * Converts _id to string id for an array of objects
 */
const replaceMongoIdInArray = <T extends MongoObject>(array: T[]) => {
  return array.map((item) => {
    const { _id, ...rest } = item;
    return {
      id: _id.toString(),
      ...rest,
    } as Omit<T, '_id'> & { id: string };
  });
};

/**
 * Converts _id to string id for a single object
 */
const replaceMongoIdInObject = <T extends MongoObject>(obj: T) => {
  const { _id, ...rest } = obj;
  return {
    id: _id.toString(),
    ...rest,
  } as Omit<T, '_id'> & { id: string };
};

export { replaceMongoIdInArray, replaceMongoIdInObject };