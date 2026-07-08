/**
 * 4×4 matrix class compatible with WebGL uniform uploads.
 * Column-major layout matching OpenGL/WebGL conventions.
 */
export declare class Matrix4 {
    elements: Float32Array;
    constructor(opt_src?: Matrix4);
    /** Set the identity matrix. */
    setIdentity(): Matrix4;
    /** Copy matrix. */
    set(src: Matrix4): Matrix4;
    /** Multiply the matrix from the right. */
    concat(other: Matrix4): Matrix4;
    /** Alias for concat. */
    multiply(other: Matrix4): Matrix4;
    /** Multiply the three-dimensional vector. */
    multiplyVector3(pos: Vector3): Vector3;
    /** Multiply the four-dimensional vector. */
    multiplyVector4(pos: Vector4): Vector4;
    /** Transpose the matrix. */
    transpose(): Matrix4;
    /** Calculate the inverse matrix of specified matrix, and set to this. */
    setInverseOf(other: Matrix4): Matrix4;
    /** Calculate the inverse matrix of this, and set to this. */
    invert(): Matrix4;
    /** Set the orthographic projection matrix. */
    setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    /** Multiply the orthographic projection matrix from the right. */
    ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    /** Set the perspective projection matrix by fovy and aspect. */
    setPerspective(fovy: number, aspect: number, near: number, far: number): Matrix4;
    /** Multiply the perspective projection matrix from the right. */
    perspective(fovy: number, aspect: number, near: number, far: number): Matrix4;
    /** Set the matrix for scaling. */
    setScale(x: number, y: number, z: number): Matrix4;
    /** Multiply the matrix for scaling from the right. */
    scale(x: number, y: number, z: number): Matrix4;
    /** Set the matrix for translation. */
    setTranslate(x: number, y: number, z: number): Matrix4;
    /** Multiply the matrix for translation from the right. */
    translate(x: number, y: number, z: number): Matrix4;
    /** Set the matrix for rotation. Angle in degrees. */
    setRotate(angle: number, x: number, y: number, z: number): Matrix4;
    /** Multiply the matrix for rotation from the right. Angle in degrees. */
    rotate(angle: number, x: number, y: number, z: number): Matrix4;
    /** Set the viewing matrix. */
    setLookAt(eyeX: number, eyeY: number, eyeZ: number, centerX: number, centerY: number, centerZ: number, upX: number, upY: number, upZ: number): Matrix4;
    /** Multiply the viewing matrix from the right. */
    lookAt(eyeX: number, eyeY: number, eyeZ: number, centerX: number, centerY: number, centerZ: number, upX: number, upY: number, upZ: number): Matrix4;
    /** Multiply the matrix for projecting vertex to plane from the right. */
    dropShadow(plane: number[], light: number[]): Matrix4;
    /** Multiply the matrix for projecting vertex to plane from the right (parallel light). */
    dropShadowDirectionally(normX: number, normY: number, normZ: number, planeX: number, planeY: number, planeZ: number, lightX: number, lightY: number, lightZ: number): Matrix4;
    /** Set the perspective projection matrix from frustum bounds. */
    setFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    /** Multiply the perspective projection matrix from the right. */
    frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
}
/**
 * 3-component vector.
 */
export declare class Vector3 {
    elements: Float32Array;
    constructor(opt_src?: number[] | Float32Array);
    /** Normalize this vector in place. */
    normalize(): Vector3;
}
/**
 * 4-component vector.
 */
export declare class Vector4 {
    elements: Float32Array;
    constructor(opt_src?: number[] | Float32Array);
}
