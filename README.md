# 视频人像抹除 - 在各种背景环境中抹除人像
运用机器学习在复杂背景中抹除人像。

中文	[English](./README.EN.md)

## 原理介绍

Google研发了一个人像识别模型BodyPix，可以实时地将视频中所有人像标记出来。正如《三体》中的「思想钢印」，如果我们给这个模型的结果一个「+」号，那就是把每个人识别出来，但是如果给个「-」号，那么就可以把这些人从背景中抹去。

在这个项目中，算法根据模型得出的结果，实时地将没有人像的部分写入缓冲区，并且在具有人像的地方使用缓存区中相同位置的数据替代。因此要求视频中的场景必须静止（建议摄像头固定不动），并且所有背景环境必须在一开始的时候没有被人像遮住。

具体体验效果依赖于设备性能，我在我的手机Redmi K20 Pro(Snapdragon 855, 6GB RAM)上进行测试，自我感觉能够较为流畅地使用（20-25 FPS）；但是在iPad mini 2(Apple A7, 1GB RAM)上进行测试就发现就难以正常使用（2-3 FPS）。在绝大部分PC上运行应该没问题。

该项目尚处于实验阶段，效果可能并不佳。

![效果演示](./demo.gif)

## 露脸模式

新增露脸模式，在抹除模式的基础上显示出我们的脸，十分有趣。

## 在线演示

点击下面的链接就可以观看在线演示啦。如果你喜欢的话请Fork或者Star一下哦。

FSYZ.online: [https://fsyz.online/demo/Web-rmbody/](https://fsyz.online/demo/Web-rmbody/)

Gitee Pages: [https://futrime.gitee.io/web-rmbody/](https://futrime.gitee.io/web-rmbody/)

## 本地使用方法

你可以克隆本仓库后直接使用浏览器打开 `./index.html` 。

部分浏览器可能不支持本地运行，你可能需要租用服务器。本程序不具备任何需要在服务器执行的代码，因此你可以使用纯静态服务器。

要下载模型，请使用Python 3执行 `./model-downloader/main.py`，模型将会自动下载到 `./model-downloader/bodypix/` 。

## 附加声明

本项目基于 [jasonmayes/Real-Time-Person-Removal](https://github.com/jasonmayes/Real-Time-Person-Removal) 二次开发。

更多内容，欢迎前往 [我的个人空间](https://blog.futrime.com) 或者 [我的收集站](https://fsyz.online) 。
