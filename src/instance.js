// @flow

// stats
import {getStats, statsCache} from './stats';

// types
import type {MicroMemoizeOptions, StatsProfile} from './types';

// utils
import {createFindKeyIndex} from './utils';

/**
 * @private
 *
 * @function addInstanceMethods
 *
 * @description
 * add methods to the moized fuction object that allow extra features
 *
 * @modifies {moized}
 *
 * @param {function} moized the memoized function
 * @returns {void}
 */
export const addInstanceMethods = (moized: Function): void => {
  const {isEqual, isMatchingKey, onCacheAdd, onCacheChange, transformKey} = moized.options;

  const findKeyIndex: Function = createFindKeyIndex(isEqual, isMatchingKey);

  Object.assign(moized, {
    add(key: Array<any>, value: any): void {
      const savedKey: Array<any> = transformKey ? transformKey(key) : key;

      if (!~findKeyIndex(moized.cache.keys, savedKey)) {
        if (moized.cache.size >= moized.options.maxSize) {
          moized.cache.keys.pop();
          moized.cache.values.pop();
        }

        moized.cache.keys.unshift(savedKey);
        moized.cache.values.unshift(value);

        onCacheAdd(moized.cache, moized.options, moized);
        onCacheChange(moized.cache, moized.options, moized);
      }
    },
    clear(): void {
      moized.cache.keys.length = 0;
      moized.cache.values.length = 0;

      onCacheChange(moized.cache, moized.options, moized);
    },
    get(key: Array<any>): any {
      const keyIndex: number = findKeyIndex(moized.cache.keys, transformKey ? transformKey(key) : key);

      return ~keyIndex ? moized.apply(this, moized.cache.keys[keyIndex]) : undefined;
    },
    getStats(): StatsProfile {
      const {profileName} = moized.options;

      return getStats(profileName);
    },
    has(key: Array<any>): boolean {
      return !!~findKeyIndex(moized.cache.keys, transformKey ? transformKey(key) : key);
    },
    keys(): Array<Array<any>> {
      return moized.cacheSnapshot.keys;
    },
    remove(key: Array<any>): void {
      const keyIndex: number = findKeyIndex(moized.cache.keys, transformKey ? transformKey(key) : key);

      if (~keyIndex) {
        moized.cache.keys.splice(keyIndex, 1);
        moized.cache.values.splice(keyIndex, 1);

        onCacheChange(moized.cache, moized.options, moized);
      }
    },
    values(): Array<Array<any>> {
      return moized.cacheSnapshot.values;
    }
  });
};

/**
 * @private
 *
 * @function addInstanceMethods
 *
 * @description
 * add propeties to the moized fuction object that surfaces extra information
 *
 * @modifies {moized}
 *
 * @param {function} moized the memoized function
 * @param {Array<Expiration>} expirations the list of expirations for cache items
 * @param {Options} options the options passed to the moizer
 * @param {function} originalFunction the function that is being memoized
 * @returns {void}
 */
export const addInstanceProperties = (
  moized: Function,
  {expirations, options: moizeOptions, originalFunction}: Object
): void => {
  const microMemoizeOptions: MicroMemoizeOptions = moized.options;

  Object.defineProperties(
    moized,
    ({
      _microMemoizeOptions: {
        configurable: true,
        get() {
          return microMemoizeOptions;
        }
      },
      expirations: {
        configurable: true,
        get() {
          return expirations;
        }
      },
      expirationsSnapshot: {
        configurable: true,
        get() {
          return expirations.slice(0);
        }
      },
      isCollectingStats: {
        configurable: true,
        get() {
          return statsCache.isCollectingStats;
        }
      },
      isMoized: {
        configurable: true,
        get() {
          return true;
        }
      },
      options: {
        configurable: true,
        get() {
          return moizeOptions;
        }
      },
      originalFunction: {
        configurable: true,
        get() {
          return originalFunction;
        }
      }
    }: Object)
  );

  if (moizeOptions.isReact) {
    Object.assign(moized, {
      contextTypes: originalFunction.contextTypes,
      defaultProps: originalFunction.defaultProps,
      displayName: `Moized(${originalFunction.displayName || originalFunction.name || 'Component'})`,
      propTypes: originalFunction.propTypes
    });
  }
};

/**
 * @private
 *
 * @function augmentMoizeInstance
 *
 * @description
 * add methods and properties to the memoized function for more features
 *
 * @param {function} moized the memoized function
 * @param {Object} configuration the configuration object for the instance
 * @returns {function} the memoized function passed
 */
export const augmentMoizeInstance = (moized: Function, configuration: Object): Function => {
  addInstanceMethods(moized);
  addInstanceProperties(moized, configuration);

  return moized;
};