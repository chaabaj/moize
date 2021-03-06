// @flow

// constants
import {DEFAULT_OPTIONS} from './constants';

// types
import type {
  Expiration,
  Options,
} from './types';

/**
 * @private
 *
 * @function combine
 *
 * @description
 * method to combine functions and return a single function that fires them all
 *
 * @param {...Array<any>} functions the functions to compose
 * @returns {function(...Array<any>): any} the composed function
 */
export const combine = (...functions: Array<any>): ?Function => {
  if (functions.length) {
    return functions.reduce(
      // $FlowIgnore return value is always a function
      (f: Function, g: any): Function =>
        typeof f === 'function'
          ? typeof g === 'function'
            ? function(): any {
              // eslint-disable-next-line prefer-rest-params
              g.apply(this, arguments);
              // eslint-disable-next-line prefer-rest-params
              f.apply(this, arguments);
            }
            : f
          : typeof g === 'function'
            ? g
            : undefined
    );
  }
};

/**
 * @private
 *
 * @function compose
 *
 * @description
 * method to compose functions and return a single function
 *
 * @param {...Array<any>} functions the functions to compose
 * @returns {function(...Array<any>): any} the composed function
 */
export const compose = (...functions: Array<any>): ?Function => {
  if (functions.length) {
    return functions.reduce(
      // $FlowIgnore return value is always a function
      (f: Function, g: any): Function =>
        typeof f === 'function'
          ? typeof g === 'function'
            ? function(): any {
              // eslint-disable-next-line prefer-rest-params
              return f(g.apply(this, arguments));
            }
            : f
          : typeof g === 'function'
            ? g
            : undefined
    );
  }
};

/**
 * @private
 *
 * @function findExpirationIndex
 *
 * @description
 * find the index of the expiration based on the key
 *
 * @param {Array<Expiration>} expirations the list of expirations
 * @param {Array<any>} key the key to match
 * @returns {number} the index of the expiration
 */
export const findExpirationIndex = (expirations: Array<Expiration>, key: Array<any>): number => {
  for (let index: number = 0; index < expirations.length; index++) {
    if (expirations[index].key === key) {
      return index;
    }
  }

  return -1;
};

export const createFindKeyIndex = (isEqual: Function, isMatchingKey: ?Function) => {
  const areKeysEqual: Function =
    typeof isMatchingKey === 'function'
      ? isMatchingKey
      : (cacheKey: Array<any>, key: Array<any>) => {
        for (let index = 0; index < key.length; index++) {
          if (!isEqual(cacheKey[index], key[index])) {
            return false;
          }
        }

        return true;
      };

  /**
   * @private
   *
   * @function findKeyIndex
   *
   * @description
   * find the index of the key in the list of cache keys
   *
   * @param {Array<Array<any>>} keys the list of keys in cache
   * @param {Array<any>} key the key to match
   * @returns {number} the index of the key
   */
  return (keys: Array<Array<any>>, key: Array<any>): number => {
    for (let keysIndex = 0; keysIndex < keys.length; keysIndex++) {
      if (keys[keysIndex].length === key.length) {
        if (areKeysEqual(keys[keysIndex], key)) {
          return keysIndex;
        }
      }
    }

    return -1;
  };
};

/**
 * @private
 *
 * @function getArrayKey
 *
 * @description
 * return the transformed key as an array
 *
 * @param {any} key the transformed key
 * @returns {Array<any>} the key as an array
 */
export const getArrayKey = (key: any): Array<any> => (Array.isArray(key) ? key : [key]);

/**
 * @private
 *
 * @function mergeOptions
 *
 * @description
 * merge two options objects, combining or composing functions as necessary
 *
 * @param {Options} originalOptions the options that already exist on the method
 * @param {Options} newOptions the new options to merge
 * @returns {Options} the merged options
 */
export const mergeOptions = (originalOptions: Options, newOptions: Options): Options =>
  newOptions === DEFAULT_OPTIONS
    ? originalOptions
    : Object.assign({}, originalOptions, newOptions, {
      // $FlowIgnore undefined value is ok
      onCacheAdd: combine(originalOptions.onCacheAdd, newOptions.onCacheAdd),
      // $FlowIgnore undefined value is ok
      onCacheChange: combine(originalOptions.onCacheChange, newOptions.onCacheChange),
      // $FlowIgnore undefined value is ok
      onCacheHit: combine(originalOptions.onCacheHit, newOptions.onCacheHit),
      // $FlowIgnore undefined value is ok
      transformArgs: compose(
        originalOptions.transformArgs,
        newOptions.transformArgs
      ),
    });
