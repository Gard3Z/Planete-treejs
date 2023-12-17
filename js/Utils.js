/** Fonction pour renvoyer un ratio qui permet de convertir les degrés en radians 
 * @example
 * let deg = 180.0;
 * console.log(d2R(deg))
 */
function d2R(v){
    return v / 180.0 * Math.PI
}
/** Fonction pour renvoyer un ratio qui permet de convertir les radians en degrés
 * @example
 * let rad = Math.PI;
 * console.log(r2D(rad))
 */
function r2D(v){
    return v / Math.PI * 180.0
}



// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
// EXPORT
export {
    d2R, r2D,
}