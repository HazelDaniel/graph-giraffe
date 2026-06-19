export const PI = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679;
export const WAIT = function (secs, callback) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            try {
                if (callback)
                    callback();
                res(true);
            }
            catch (err) {
                rej(err);
            }
        }, secs * 1000);
    });
};
//# sourceMappingURL=globals.js.map