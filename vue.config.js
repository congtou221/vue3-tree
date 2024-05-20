const path = require('path');
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.module
      .rule('ts')
      .test(/\.tsx?$/)
      .include 
      .add(path.resolve(__dirname, 'src')) // 使用绝对路径添加 src 目录
      .end()
      .use('ts-loader')
      .loader('ts-loader')
      .end();
  },
});
