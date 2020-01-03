# taro-debug

基于Taro制作的debug页面，便于测试人员、客户有效的反馈必要信息。

## 有什么用？

在日常的开发过程中，经常收到测试人员和甲方爸爸的反馈，然而很多情况下反馈的信息是极其不清晰的，需要我们不断询问手机系统、微信版本、基础库版本等信息，才能有效的排查错误。而不断询问是极其耗费时间的，有时候甲方爸爸还不知道怎么查看信息，因此我制作了debug页面，把我们需要的信息直接显示出来，让他们直接截图发给我们即可。

## 怎么使用？

页面基于`taro1.3.25`制作，因此你需要在taro中才能使用。  

你可以把这个项目下载到本地，执行 `npm i` ，依赖安装完成时执行taro的编译指令，在小程序开发工具打开就能看到效果。

我使用`TypeScript+Scss`，如果你在脚手架中也和我使用的一样，直接把 `src/pages/debug` 复制到你的`src/pages` 目录，同时在app.tsx中填写`/pages/debug/index`就可以使用了，如果你使用的是其他类型的，可能需要做适当改造，但其实并不复杂。

你可以通过以下方式添加入口：  

1. 在app中监听截屏事件，询问是否遇到问题前往debug页面。

2. 在app中监听摇一摇事件，询问是否遇到问题前往debug页面。

3. 在某个页面监听input的输入文本，比如输入`::debug`时跳转到debug页面。

## 兼容性

目前在微信端、支付宝端测试能够正常使用，理论上其他小程序平台也能使用，如果你在其他端使用遇到了问题可以给我反馈，邮箱 `iamxiyang[at]foxmail.com` ，我会进行处理。

## 最后

我不知道有没有人使用，如果你用了请留下一个 `star` 让我知道有人在用，谢谢。