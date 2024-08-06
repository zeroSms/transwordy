// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })


module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@vue/runtime-core': require.resolve('@vue/runtime-core'),
        '@vue/runtime-dom': require.resolve('@vue/runtime-dom')
      }
    }
  },
  chainWebpack: config => {
    config
      .plugin('define')
      .tap(definitions => {
        definitions[0]['__VUE_PROD_HYDRATION_MISMATCH_DETAILS__'] = JSON.stringify(false);
        return definitions;
      });
  }
};
