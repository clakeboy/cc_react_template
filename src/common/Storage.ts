/**
 * Created by clakeboy on 2017/4/19.
 */
let Storage = {
    set: function (key: string, value: any) {
        if (window.localStorage) {
            if (typeof value === "object") {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.setItem(key, value)
            }
        }
    },
    get: function (key:string) {
        if (window.localStorage) {
            return localStorage.getItem(key)
        } else {
            return null;
        }
    },
    clear: function () {
        if (window.localStorage) {
            localStorage.clear();
        }
    },
    remove: function (key:string) {
        if (window.localStorage) {
            localStorage.removeItem(key);
        }
    }
};
export default Storage;