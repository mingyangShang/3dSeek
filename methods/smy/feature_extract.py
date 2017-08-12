# -*- coding: utf-8 -*-
import tensorflow as tf
import numpy as np
from methods.lhl.feature_extract import get_vgg_feature
from methods.smy.rnn.train import inference
"""
需要实现以下函数:
get_feature_from_image_list(img_path)

"""

def get_feature_from_image_list(image_list):
    """

    :param image_list: image paths, length = 1 means an image, length = 12 means a model 
    :return: 1-dim feature vector, numpy array
    """
    vgg_feature = get_vgg_feature(image_list)
    if len(vgg_feature) == 1:
        vgg_feature = [vgg_feature for _ in range(12)]
    try:
        return inference(vgg_feature)[0]
    except Exception as e:
        print("smy inference error:", e)
        return None