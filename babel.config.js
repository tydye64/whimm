module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    // Reanimated 4 ships its worklet transform in react-native-worklets, and it
    // has to stay last in the plugin list.
    plugins: ['react-native-worklets/plugin'],
  };
};
