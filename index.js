const KeyValueStore = require('@tomassotech/simplekeyvaluestore')

const OnDemandCache = (maxSize, options = {}) => {
    const { cacheLifetime, itemLifetime } = options;
    const itemsHaveLifetime = typeof (itemLifetime) !== 'undefined';
    const cacheHasLifetime = typeof (cacheLifetime) !== 'undefined';
    const __keyValueStore = KeyValueStore(maxSize);
    const __removeItem = (key) => {
        __keyValueStore.removeItem(key);
    };
    if (cacheHasLifetime) {
        setInterval(() => {
            __keyValueStore.clearAllItems();
        }, cacheLifetime);
    }
    return ({
        getCache: () => __keyValueStore.getStore(),
        getItem: async (key, emptyCacheFunction) => {
            const result = __keyValueStore.getItem(key);
            if (typeof (result) === 'undefined') {
                try {
                    const retrievedResult = await emptyCacheFunction();
                    __keyValueStore.addItem(key, retrievedResult);
                    return new Promise((resolve) => resolve(retrievedResult));
                }
                catch (error) {
                    return new Promise((_, reject) => reject(error));
                }
            }
            return new Promise((resolve) => resolve(result));
        },
        addItem: (key, value) => {
            __keyValueStore.addItem(key, value);
            if (itemsHaveLifetime) {
                setTimeout(() => __removeItem(key), itemLifetime);
            }
        },
        removeItem: __removeItem,
        clearCache: () => {
            __keyValueStore.clearAllItems();
        }
    });
};

module.exports = OnDemandCache