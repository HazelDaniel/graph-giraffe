export const PI = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679;

export const WAIT = function (secs: number, callback?: () => void) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      try {
        if (callback) callback();
        res(true);
      } catch (err) {
        rej(err);
      }
    }, secs * 1000);
  });
};

/** POLYFILLS FOR OLDER BROWSERS */

if (typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    if (typeof radii === 'number') radii = [radii, radii, radii, radii];
    if (!Array.isArray(radii)) radii = [0, 0, 0, 0];
    
    let tl = (radii as unknown as Array<any>)[0] || 0;
    let tr = (radii as unknown as Array<any>)[1] !== undefined ? (radii as unknown as Array<any>)[1] : tl;
    let br = (radii as unknown as Array<any>)[2] !== undefined ? (radii as unknown as Array<any>)[2] : tr;
    let bl = (radii as unknown as Array<any>)[3] !== undefined ? (radii as unknown as Array<any>)[3] : tl;

    this.beginPath();
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.arcTo(x + w, y, x + w, y + tr, tr);
    this.lineTo(x + w, y + h - br);
    this.arcTo(x + w, y + h, x + w - br, y + h, br);
    this.lineTo(x + bl, y + h);
    this.arcTo(x, y + h, x, y + h - bl, bl);
    this.lineTo(x, y + tl);
    this.arcTo(x, y, x + tl, y, tl);
    this.closePath();
    return this;
  };
}


export const dumbGlyphHeight = 16;
export const dumbGlyphWidth = 16;