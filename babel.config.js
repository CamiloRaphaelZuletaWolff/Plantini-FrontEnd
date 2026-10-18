module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // zustand's ESM build reads `import.meta.env`, which crashes the web
          // bundle ("Cannot use 'import.meta' outside a module") because Expo
          // web loads it as a classic script. Polyfill import.meta on all
          // platforms (Expo only does it for server bundles by default).
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};
