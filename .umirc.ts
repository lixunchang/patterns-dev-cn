import { defineConfig } from 'dumi';

export default defineConfig({
  base: '/patterns-dev-cn',
  publicPath: process.env.NODE_ENV === 'production' ? '/patterns-dev-cn/' : '/',
  title: 'React设计模式',
  favicon:
    'https://www.runoob.com/wp-content/uploads/2016/02/react.png',
  logo: 'https://www.runoob.com/wp-content/uploads/2016/02/react.png',
  outputPath: 'docs-dist',
  mode: 'site',
  // more config: https://d.umijs.org/config
  resolve:{passivePreview:true}
});
