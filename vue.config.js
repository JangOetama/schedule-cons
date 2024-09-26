const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,

  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
  },

  devServer: {
    overlay: {
      warnings: false,
      errors: false
    }
  },

  devServer: {
    proxy: {
      '/api': {
        target: 'http://feelbuymobile.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/6/j-stock-api/api.php',
        },
      },
    },
  },
});

