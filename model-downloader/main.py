 #
 # @license
 # Modifications copyright 2020 Zijian Zhang.
 # 
 # Licensed under the Apache License, Version 2.0 (the "License");
 # you may not use this file except in compliance with the License.
 # You may obtain a copy of the License at
 # 
 #      http://www.apache.org/licenses/LICENSE-2.0
 # 
 # Unless required by applicable law or agreed to in writing, software
 # distributed under the License is distributed on an "AS IS" BASIS,
 # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 # See the License for the specific language governing permissions and
 # limitations under the License.
 #

 #
 # This is a downloader for Web-rmbody.
 # It aims to download all the required models from official source (or any other source).
 #
 # You can simply use Python 3 to execute this program and models will be stored in ./bodypix
 #
 # This program is tested within Python 3.5 and later versions of Python 3.
 # This program doesn't support Python 2 and I don't think adapt it to Python 2 is a good idea.
 #

import urllib.request as req
import os
import json

# The source from which the bodypix models download
url_prefix = 'https://storage.googleapis.com/tfjs-models/savedmodel/'

def download_resnet50(outputStride, quantBytes):
    url_infix = 'bodypix/resnet50/' + quantBytes + '/'
    url_suffix = 'model-stride' + str(outputStride) +'.json'
    url = url_prefix + url_infix + url_suffix
    if not os.path.exists(url_infix):
        os.makedirs(url_infix)
    
    print('Getting', url_infix + url_suffix)
    model_json = req.urlopen(url).read()
    if not os.path.exists(url_infix + url_suffix):
        with open(url_infix + url_suffix, 'wb') as f:
            f.write(model_json)
    model_paths = json.loads(model_json.decode())['weightsManifest'][0]['paths']

    for i in model_paths:
        url = url_prefix + url_infix + i
        print('Getting', url_infix + i)
        if os.path.exists(url_infix + i):
            continue
        model = req.urlopen(url).read()
        with open(url_infix + i, 'wb') as f:
            f.write(model)

def download_mobilenetv1(outputStride, quantBytes, multiplier):
    url_infix = 'bodypix/mobilenet/' + quantBytes + '/' + multiplier + '/'
    url_suffix = 'model-stride' + str(outputStride) +'.json'
    url = url_prefix + url_infix + url_suffix
    if not os.path.exists(url_infix):
        os.makedirs(url_infix)
    
    print('Getting', url_infix + url_suffix)
    model_json = req.urlopen(url).read()
    if not os.path.exists(url_infix + url_suffix):
        with open(url_infix + url_suffix, 'wb') as f:
            f.write(model_json)
    model_paths = json.loads(model_json.decode())['weightsManifest'][0]['paths']

    for i in model_paths:
        url = url_prefix + url_infix + i
        print('Getting', url_infix + i)
        if os.path.exists(url_infix + i):
            continue
        model = req.urlopen(url).read()
        with open(url_infix + i, 'wb') as f:
            f.write(model)



# For ResNet50
outputStride = [16, 32]
quantBytes = ['quant1', 'quant2', 'float']

for i in outputStride:
    for j in quantBytes:
        download_resnet50(i, j)


# For MobileNetV1
outputStride = [8, 16]
quantBytes = ['quant1', 'quant2', 'float']
multiplier = ['100', '075', '050']

for i in outputStride:
    for j in quantBytes:
        for k in multiplier:
            download_mobilenetv1(i, j, k)
