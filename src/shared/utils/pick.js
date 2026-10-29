/**
 * Picks only the specified fields from an object.
 * Useful for whitelisting request body fields.
 *
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to pick
 * @returns {Object} New object with only the specified keys
 */
const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

module.exports = pick;
