// node-domexception shim to use native DOMException in Node 18+
module.exports = global.DOMException || Error;
