module.exports = function (api) {
  api.cache(true); // Nên có api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    // Bạn có thể có các plugins khác ở đây nếu cần
  };
};
