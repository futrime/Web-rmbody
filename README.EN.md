# Web-rmbody - Body Parts Removal on Web
Remove body parts from complex background using Machine Learning with TensorFlow.js in Javascript.

[中文](./README.md)	English

## Introduction

Recently, Google has released a Body parts recognizing ML model called BodyPix, which can mark all the body parts in an image up and generate a mask of it in real time. So if we clear the pixels under the mask, the body parts will be removed.

In this program, the machine would write the pixels not within body parts into a buffer, and use the content in buffer to cover the pixels within body parts. Therefore, it requires that the video background should be still (Fixed webcam is the best), and every pixel in the image should be uncovered some time.

The experience depends on the performance of your device. I've try it on my mobile phone Redmi K20 Pro (Mi 9T Pro) with Snapdragon 855 CPU and 6GiB RAM and the experience was not bad (Above 20 fps). But when trying to run it on my iPad mini 2 with Apple A7 CPU and 1GiB RAM, it hardly worked properly. By the way, it might run well on almost all the contemporary PCs.

The program is now experimental and the performance might not be satisfying.

![Demo video](./demo.gif)

If you are fond of this project, please star it and fork it!

## Only-face Mode

Hide every part of our body except our faces.

## Online Demonstration

Just click the links below to experience online demonstration.

FSYZ.online: [https://fsyz.online/demo/Web-rmbody/](https://fsyz.online/demo/Web-rmbody/)

Gitee Pages: [https://futrime.gitee.io/web-rmbody/](https://futrime.gitee.io/web-rmbody/)

## How to use locally

Just clone this repository and start from `./index.html` in your browser.

Running locally might be restricted in some browsers, so you might have to rent a web server.This program doesn't contain any code running on server (except the model-downloader, but you can run it on your own PC and upload the models to your server), which means you can use static web server.

If you'd like to load the models on your own server, you can easily execute `./model-downloader/main.py` in Python 3. The models will be automatically downloaded and stored in `./model-downloader/bodypix/` .

## Additional Statements

This repository bases on [jasonmayes/Real-Time-Person-Removal](https://github.com/jasonmayes/Real-Time-Person-Removal). And I optimized it and add some useful features.

For more about me, please go to [my personal blog](https://blog.futrime.com) and [my collection site](https://fsyz.online)
