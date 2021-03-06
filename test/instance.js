// test
import test from 'ava';
import memoize from 'micro-memoize';
import sinon from 'sinon';

// src
import * as instance from 'src/instance';
import * as options from 'src/options';
import * as stats from 'src/stats';

test('if addInstanceMethods will add functions to the moized object', (t) => {
  const moized = () => {};

  moized.options = {
    isEqual() {},
    onCacheAdd() {},
    onCacheChange() {},
    transformKey() {},
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  t.is(typeof moized.add, 'function');
  t.is(typeof moized.clear, 'function');
  t.is(typeof moized.get, 'function');
  t.is(typeof moized.getStats, 'function');
  t.is(typeof moized.has, 'function');
  t.is(typeof moized.keys, 'function');
  t.is(typeof moized.remove, 'function');
  t.is(typeof moized.values, 'function');
});

test('if moized.add will add the item to the cache if it does not already exist', (t) => {
  const moized = () => {};

  moized.cache = {
    keys: [],
    size: 0,
    values: [],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd: sinon.spy(),
    onCacheChange: sinon.spy(),
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const key = ['key'];
  const value = 'value';

  moized.add(key, value);

  t.deepEqual(moized.cache.keys, [key]);
  t.deepEqual(moized.cache.values, [value]);

  t.true(moized.options.onCacheAdd.calledOnce);
  t.true(moized.options.onCacheAdd.calledWith(moized.cache));

  t.true(moized.options.onCacheChange.calledOnce);
  t.true(moized.options.onCacheChange.calledWith(moized.cache));
});

test('if moized.add will add the item to the cache if it does not already exist with a transformed key', (t) => {
  const moized = () => {};

  moized.cache = {
    keys: [],
    size: 0,
    values: [],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd: sinon.spy(),
    onCacheChange: sinon.spy(),
    transformKey: options.getTransformKey({
      transformArgs: (args) =>
        args[0]
          .split('')
          .reverse()
          .join(''),
    }),
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const key = ['key'];
  const value = 'value';

  moized.add(key, value);

  t.deepEqual(moized.cache.keys, [
    [
      key[0]
        .split('')
        .reverse()
        .join(''),
    ],
  ]);
  t.deepEqual(moized.cache.values, [value]);

  t.true(moized.options.onCacheAdd.calledOnce);
  t.true(moized.options.onCacheAdd.calledWith(moized.cache));

  t.true(moized.options.onCacheChange.calledOnce);
  t.true(moized.options.onCacheChange.calledWith(moized.cache));
});

test('if moized.add will add the item to the cache if it does not already exist with a transformed key that is an array', (t) => {
  const moized = () => {};

  moized.cache = {
    keys: [],
    size: 0,
    values: [],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd: sinon.spy(),
    onCacheChange: sinon.spy(),
    transformKey: sinon.stub().callsFake((args) => ['foo', args[0]]),
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const key = ['key'];
  const value = 'value';

  moized.add(key, value);

  t.deepEqual(moized.cache.keys, [['foo', key[0]]]);
  t.deepEqual(moized.cache.values, [value]);

  t.true(moized.options.onCacheAdd.calledOnce);
  t.true(moized.options.onCacheAdd.calledWith(moized.cache));

  t.true(moized.options.onCacheChange.calledOnce);
  t.true(moized.options.onCacheChange.calledWith(moized.cache));
});

test('if moized.add will remove the oldest item from cache if the maxSize is exceeded', (t) => {
  const moized = () => {};

  moized.cache = {
    keys: [['existingKey']],
    size: 1,
    values: ['existingValue'],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    maxSize: 1,
    onCacheAdd: sinon.spy(),
    onCacheChange: sinon.spy(),
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const key = ['key'];
  const value = 'value';

  moized.add(key, value);

  t.deepEqual(moized.cache.keys, [key]);
  t.deepEqual(moized.cache.values, [value]);

  t.true(moized.options.onCacheAdd.calledOnce);
  t.true(moized.options.onCacheAdd.calledWith(moized.cache));

  t.true(moized.options.onCacheChange.calledOnce);
  t.true(moized.options.onCacheChange.calledWith(moized.cache));
});

test('if moized.add will do nothing if the item already exists in cache', (t) => {
  const moized = () => {};

  const key = ['key'];
  const value = 'value';

  moized.cache = {
    keys: [key],
    size: 1,
    values: [value],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd: sinon.spy(),
    onCacheChange: sinon.spy(),
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  moized.add(key, value);

  t.deepEqual(moized.cache.keys, [key]);
  t.deepEqual(moized.cache.values, [value]);

  t.true(moized.options.onCacheAdd.notCalled);

  t.true(moized.options.onCacheChange.notCalled);
});

test('if moized.clear will clear the items in cache', (t) => {
  const moized = () => {};

  const key = ['key'];
  const value = 'value';

  moized.cache = {
    keys: [key],
    values: [value],
  };

  moized.options = {
    isEqual() {},
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  moized.clear();

  t.deepEqual(moized.cache.keys, []);
  t.deepEqual(moized.cache.values, []);
});

test('if moized.get will get the item from cache if the key exists', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [key],
    values: [value],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const result = moized.get(key);

  t.true(moized.calledOnce);
  t.true(moized.calledWith(...key));

  t.is(result, value);
});

test('if moized.get will not get the item from cache if the key does not exist', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [],
    values: [],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const result = moized.get(key);

  t.true(moized.notCalled);

  t.is(result, undefined);
});

test('if moized.get will get the item from cache if the transformed key exists', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [key],
    values: [value],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey(key) {
      return key;
    },
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const result = moized.get(key);

  t.true(moized.calledOnce);
  t.true(moized.calledWith(...key));

  t.is(result, value);
});

test('if moize.getStats will call getStats with the profileName in options', (t) => {
  const moized = () => {};

  moized.options = {
    profileName: 'profileName',
  };

  const stub = sinon.stub(stats, 'getStats').returnsArg(0);

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const result = moized.getStats();

  t.true(stub.calledOnce);
  t.true(stub.calledWith(moized.options.profileName));

  t.is(result, moized.options.profileName);
});

test('if moized.has will return true if the key exists', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [key],
    values: [value],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  t.true(moized.has(key));
});

test('if moized.has will return false if the key does not exist', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [],
    values: [],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  t.false(moized.has(key));
});

test('if moized.has will return true if the transformed key exists in cache', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [key],
    values: [value],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey(key) {
      return key;
    },
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  t.true(moized.has(key));
});

test('if moized.keys will return a shallow clone of the keys', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [key],
    values: [value],
  };

  Object.defineProperties(moized, {
    cacheSnapshot: {
      get() {
        return {
          keys: [...moized.cache.keys],
          values: [...moized.cache.values],
        };
      },
    },
  });

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const keys = moized.keys();

  t.deepEqual(keys, moized.cache.keys);
  t.not(keys, moized.cache.keys);
});

test('if moized.remove will remove the existing key from cache', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [key],
    values: [value],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  moized.remove(key);

  t.deepEqual(moized.cache.keys, []);
  t.deepEqual(moized.cache.values, []);
});

test('if moized.remove will do nothing if the key is not found in cache', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [['foo']],
    values: ['bar'],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  moized.remove(key);

  t.deepEqual(moized.cache.keys, [['foo']]);
  t.deepEqual(moized.cache.values, ['bar']);
});

test('if moized.remove will remove the existing key from cache with a custom transformKey', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [key],
    values: [value],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey(key) {
      return key;
    },
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  moized.remove(key);

  t.deepEqual(moized.cache.keys, []);
  t.deepEqual(moized.cache.values, []);
});

test('if moized.update will set the new value in cache for the moized item', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  const keys = [['foo'], [{bar: 'baz'}], key];
  const values = ['bar', ['quz'], value];

  moized.cache = {
    keys: [...keys],
    values: [...values],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const newValue = 'new value';

  moized.update(key, newValue);

  t.deepEqual(moized.cache.keys, [key, ...keys.slice(0, keys.length - 1)]);
  t.deepEqual(moized.cache.values, [newValue, ...values.slice(0, values.length - 1)]);
});

test('if moized.update will do nothing if the key does not exist in keys', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [key],
    values: [value],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const newValue = 'new value';

  moized.update('other key', newValue);

  t.deepEqual(moized.cache.keys, [key]);
  t.deepEqual(moized.cache.values, [value]);
});

test('if moize will not call onExpire for removed cache items', async (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [key],
    values: [value],
  };

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    maxAge: 1000,
    onCacheAdd() {},
    onCacheChange() {},
    transformKey(key) {
      return key;
    },
  };

  const expirationMethod = sinon.spy();

  const configuration = {
    expirations: [
      {
        expirationMethod,
        key,
        timeoutId: setTimeout(expirationMethod, moized.options.maxAge),
      },
    ],
  };

  instance.addInstanceMethods(moized, configuration);

  await new Promise((resolve) => {
    setTimeout(resolve, 200);
  });

  moized.remove(key);

  await new Promise((resolve) => {
    setTimeout(resolve, moized.options.maxAge);
  });

  t.true(expirationMethod.notCalled);
});

test('if moized.values will return a shallow clone of the values', (t) => {
  const key = ['key'];
  const value = 'value';

  const moized = sinon.stub().callsFake(() => value);

  moized.cache = {
    keys: [key],
    values: [value],
  };

  Object.defineProperties(moized, {
    cacheSnapshot: {
      get() {
        return {
          keys: [...moized.cache.keys],
          values: [...moized.cache.values],
        };
      },
    },
  });

  moized.options = {
    isEqual(a, b) {
      return a === b;
    },
    onCacheAdd() {},
    onCacheChange() {},
    transformKey: undefined,
  };

  const configuration = {
    expirations: [],
  };

  instance.addInstanceMethods(moized, configuration);

  const values = moized.values();

  t.deepEqual(values, moized.cache.values);
  t.not(values, moized.cache.values);
});

test('if addInstanceProperties will add the correct properties to the moized method', (t) => {
  const moized = () => {};
  const options = {
    expirations: [],
    options: {
      key: 'value',
    },
    originalFunction() {},
  };

  const _microMemoizeOptions = {
    micro: 'memoize',
  };
  const cache = {
    keys: [],
    size: 0,
    values: [],
  };

  moized.cache = cache;
  moized.options = _microMemoizeOptions;

  instance.addInstanceProperties(moized, options);

  t.is(moized._microMemoizeOptions, _microMemoizeOptions);
  t.deepEqual(moized.cache, cache);
  t.is(moized.expirations, options.expirations);
  t.not(moized.expirationsSnapshot, options.expirations);
  t.deepEqual(moized.expirationsSnapshot, options.expirations);
  t.is(moized.isCollectingStats, stats.statsCache.isCollectingStats);
  t.true(moized.isMoized);
  t.is(moized.options, options.options);
  t.is(moized.originalFunction, options.originalFunction);

  t.false(moized.hasOwnProperty('displayName'));
  t.false(moized.hasOwnProperty('contextTypes'));
  t.false(moized.hasOwnProperty('defaultProps'));
  t.false(moized.hasOwnProperty('propTypes'));
});

test('if addInstanceProperties will add the correct properties to the moized React method', (t) => {
  const moized = () => {};
  const options = {
    expirations: [],
    options: {
      isReact: true,
      key: 'value',
    },
    originalFunction() {},
  };

  options.originalFunction.contextTypes = 'contextTypes';
  options.originalFunction.defaultProps = 'defaultProps';
  options.originalFunction.displayName = 'displayName';
  options.originalFunction.propTypes = 'propTypes';

  const _microMemoizeOptions = {
    micro: 'memoize',
  };
  const cache = {
    keys: [],
    values: [],
  };

  moized.cache = cache;
  moized.cacheSnapshot = {...cache};
  moized.options = _microMemoizeOptions;

  instance.addInstanceProperties(moized, options);

  t.is(moized._microMemoizeOptions, _microMemoizeOptions);
  t.deepEqual(moized.cache, cache);
  t.is(moized.expirations, options.expirations);
  t.not(moized.expirationsSnapshot, options.expirations);
  t.deepEqual(moized.expirationsSnapshot, options.expirations);
  t.is(moized.isCollectingStats, stats.statsCache.isCollectingStats);
  t.true(moized.isMoized);
  t.is(moized.options, options.options);
  t.is(moized.originalFunction, options.originalFunction);

  t.true(moized.hasOwnProperty('contextTypes'));
  t.is(moized.contextTypes, options.originalFunction.contextTypes);

  t.true(moized.hasOwnProperty('defaultProps'));
  t.is(moized.defaultProps, options.originalFunction.defaultProps);

  t.true(moized.hasOwnProperty('displayName'));
  t.is(moized.displayName, `Moized(${options.originalFunction.displayName})`);

  t.true(moized.hasOwnProperty('propTypes'));
  t.is(moized.propTypes, options.originalFunction.propTypes);
});

test('if addInstanceProperties will add the correct displayName when none is provided', (t) => {
  const moized = () => {};
  const options = {
    expirations: [],
    options: {
      isReact: true,
      key: 'value',
    },
    originalFunction() {},
  };

  const _microMemoizeOptions = {
    micro: 'memoize',
  };
  const cache = {
    keys: [],
    values: [],
  };

  moized.cache = cache;
  moized.options = _microMemoizeOptions;

  instance.addInstanceProperties(moized, options);

  t.true(moized.hasOwnProperty('displayName'));
  t.is(moized.displayName, `Moized(${options.originalFunction.name})`);
});

test('if addInstanceProperties will add the correct displayName when the function is anonymous', (t) => {
  const moized = () => {};
  const options = {
    expirations: [],
    options: {
      isReact: true,
      key: 'value',
    },
  };

  options.originalFunction = () => {};

  const _microMemoizeOptions = {
    micro: 'memoize',
  };
  const cache = {
    keys: [],
    values: [],
  };

  moized.cache = cache;
  moized.options = _microMemoizeOptions;

  instance.addInstanceProperties(moized, options);

  t.true(moized.hasOwnProperty('displayName'));
  t.is(moized.displayName, 'Moized(Component)');
});

test('if augmentMoizeInstance will add the methods and properties to the moized method', (t) => {
  const moized = memoize(() => {});
  const configuration = {
    expirations: [],
    options: {
      isEqual(a, b) {
        return a === b;
      },
      onCacheAdd() {},
      onCacheChange() {},
      transformKey: undefined,
    },
    originalFunction() {},
  };

  const result = instance.augmentMoizeInstance(moized, configuration);

  t.is(result, moized);

  t.true(moized.hasOwnProperty('add'));
  t.true(moized.hasOwnProperty('clear'));
  t.true(moized.hasOwnProperty('get'));
  t.true(moized.hasOwnProperty('getStats'));
  t.true(moized.hasOwnProperty('has'));
  t.true(moized.hasOwnProperty('keys'));
  t.true(moized.hasOwnProperty('remove'));
  t.true(moized.hasOwnProperty('values'));

  t.true(moized.hasOwnProperty('_microMemoizeOptions'));
  t.true(moized.hasOwnProperty('cache'));
  t.true(moized.hasOwnProperty('cacheSnapshot'));
  t.true(moized.hasOwnProperty('expirations'));
  t.true(moized.hasOwnProperty('expirationsSnapshot'));
  t.true(moized.hasOwnProperty('isCollectingStats'));
  t.true(moized.hasOwnProperty('isMoized'));
  t.true(moized.hasOwnProperty('options'));
  t.true(moized.hasOwnProperty('originalFunction'));
});
