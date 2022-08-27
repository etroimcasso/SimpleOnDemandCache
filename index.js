const KeyValueStore = require('@tomassotech/simplekeyvaluestore')

const OnDemandCache = (maxSize = 0, options = {}) => {
    const { cacheLifetime, itemLifetime } = options;
    const itemsHaveLifetime = typeof (itemLifetime) !== 'undefined';
    const cacheHasLifetime = typeof (cacheLifetime) !== 'undefined';
    let __keyValueStore;
    try {
        __keyValueStore = KeyValueStore(maxSize > 0 ? maxSize : undefined);
    }
    catch (error) {
        throw error;
    }
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