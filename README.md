# postcss-weex

`postcss-weex`主要解决三个问题:

1. 解决weex样式不支持简写;
2. 解决weex样式与H5样式不一致;
3. 解决不能使用绝对尺寸;

## 安装

```bash
$ npm install postcss
$ npm install postcss-weex
```

## 使用

```javascript
// for webpack2

{
    test: /\.vue(\?[^?]+)?$/,
    loader: `weex-loader`,
    options: {
        postcss: [require('postcss-weex')({env: 'weex'})]   // env: weex or web/vue whatever
    }
}
```

## 功效

### 样式简写

> 只针对weex不支持的写法, 并不能解决weex不支持的样式属性问题.

* padding简写
* margin简写
* border简写
* background简写
* border-radius简写

### 样式不一致

在weex中, 所有尺寸都会根据实际屏幕宽度基于750px进行缩放, 但是对于H5页面却并非如此. `postcss-weex`插件可以在进行H5页面打包时, 将所有`px`单位转换为`rem`单位来达到同样的效果.

### 绝对单位

在weex中, 有一个文档并未提及的单位`wx`, 当使用这个单位时, 尺寸不会进行缩放. `postcss-weex`支持使用`pt`单位(可使用options.absLenUnit来设置, 默认使用`pt`而非`wx`主要是为了在`ide`中不会有错误提示), 在weex中会自动转为`wx`, 在H5中自动转为`px`.