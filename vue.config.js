const path = require("path");
module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule("ts")
      .test(/\.ts$/)
      .include.add(path.resolve(__dirname, "src"))
      .end()
      .use("ts-loader")
      .loader("ts-loader")
      .options({
        appendTsSuffixTo: [/\.vue$/],
        transpileOnly: true, // 忽略类型检查，仅编译
      })
      .end();

    // 添加一个排除规则
    config.module
      .rule("ts-exclude")
      .test(/\.d\.tsx$/)
      .exclude.add(path.resolve(__dirname, "src"))
      .end();
  },
};
