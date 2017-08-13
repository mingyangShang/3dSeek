import numpy as np
from keras.applications.vgg19 import preprocess_input
from keras.engine import Input
from keras.layers import MaxPooling2D, Activation, Dense
from keras.models import Sequential, Model
from keras.preprocessing import image
from sklearn.externals import joblib

from data_process import vlad, normalize
from my_vgg19 import VGG19

weights_path = '/home/wangxiyang/workspace/pyworkspace/wxy/model_weights/vgg19_weights_tf_dim_ordering_tf_kernels.h5'

base_model = VGG19(include_top=True, weights_path=weights_path, classes=40)
model3_b5c4 = Model(inputs=base_model.input, outputs=base_model.get_layer('block5_conv4').output)


def get_conv4(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    return model3_b5c4.predict(x)


img_input = Input(shape=(14, 14, 512))
x_1x1 = MaxPooling2D((14, 14), strides=(1, 1), name='block1_pool')(img_input)
x_2x2 = MaxPooling2D((7, 7), strides=(7, 7), name='block1_pool')(img_input)
x_3x3 = MaxPooling2D((6, 6), strides=(4, 4), name='block1_pool')(img_input)
x_6x6 = MaxPooling2D((4, 4), strides=(2, 2), name='block1_pool')(img_input)

model_1x1 = Model(img_input, x_1x1, name='vgg19')
model_2x2 = Model(img_input, x_2x2, name='vgg19')
model_3x3 = Model(img_input, x_3x3, name='vgg19')
model_6x6 = Model(img_input, x_6x6, name='vgg19')


def get_feature_from_conv(conv_feature):
    mat_1x1 = model_1x1.predict(conv_feature)[0, :]
    mat_2x2 = model_2x2.predict(conv_feature)[0, :]
    mat_3x3 = model_3x3.predict(conv_feature)[0, :]
    mat_6x6 = model_6x6.predict(conv_feature)[0, :]

    feature_mat = np.zeros((50, 512), np.float64)
    row_counter = 0
    mat_list = [mat_1x1, mat_2x2, mat_3x3, mat_6x6]
    for mat in mat_list:
        w, h = mat.shape[:2]
        for i in range(w):
            for j in range(h):
                feature_mat[row_counter, :] = mat[i, j, :]
                row_counter += 1
    return feature_mat


def get_feature_from_view(view_path):
    return get_feature_from_conv(get_conv4(view_path))


#pca2_path = '/home/wangxiyang/workspace/pyworkspace/wxy/model_weights/_pca.pkl'
#pca2 = joblib.load(pca2_path)
#ann_model_path = '/home/wangxiyang/workspace/pyworkspace/wxy/model_weights/modelnet40_total.h5'
#ann_model = get_ann_model(weights=ann_model_path)

kmeans_path = '/home/wangxiyang/workspace/pyworkspace/wxy/model_weights/kmeans-models/pca_256_km_128.pkl'
kmeans = joblib.load(kmeans_path)
pca1_path = '/home/wangxiyang/workspace/pyworkspace/wxy/model_weights/kmeans-models/_pca_256.pkl'
pca1 = joblib.load(pca1_path)


def get_vlad_feature(feature_mat_list):
    """
    :param feature_mat:12 feature 
    :return: 
    """
    t = feature_mat_list[0]
    npmodel = len(feature_mat_list)
    w, n = t.shape[0:2]
    counter = 0
    cn = 0
    arr = np.zeros((npmodel * w, n), np.float32)
    for t in feature_mat_list:
        for i in range(w):
            arr[cn, :] = t[i, :]
            cn += 1
    return normalize(vlad(kmeans, pca1.transform(arr)))


def get_ann_model(weights=None, input_dim=1024, dense_num=1024, activation='relu'):
    model = Sequential([
        Dense(dense_num, input_shape=(input_dim,)),
        # BatchNormalization(),
        Activation(activation, name='fc'),
        Dense(40),
        Activation('softmax'),
    ])
    if weights_path is not None:
        model.load_weights(weights)
    return model


pca2_path = '/home/wangxiyang/workspace/pyworkspace/wxy/model_weights/pca-models/ann_pca.pkl'
pca2 = joblib.load(pca2_path)
ann_model_path = '/home/wangxiyang/workspace/pyworkspace/wxy/model_weights/modelnet40_total.h5'
ann_model = get_ann_model(weights=ann_model_path)

feature_model = Model(input=ann_model.input, outputs=ann_model.get_layer('fc').output)


def get_search_feature(vlad_feature):
    return feature_model.predict(pca2.transform(vlad_feature))


def get_feature_from_image_list(image_list):
    """

    :param image_list: image paths, length = 1 means an image, length = 12 means a model 
    :return: 1-dim feature vector, numpy array
    """
    feature_mat_list = []
    if len(image_list) == 1:
        feature_map = get_feature_from_view(image_list[0])
        feature_mat_list = [feature_map for i in range(12)]
    else:
        for image_path in image_list:
            feature_mat_list.append(get_feature_from_view(image_path))
    vlad_feature = get_vlad_feature(feature_mat_list)
    return get_search_feature(vlad_feature)


if __name__ == '__main__':
    image_list = ['/home/wangxiyang/workspace/3dSeek/static/img/bathtub_view.jpg']
    feature = get_feature_from_image_list(image_list)
    print(feature)
