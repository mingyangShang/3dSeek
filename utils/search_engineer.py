import numpy as np
from sklearn.neighbors import KDTree
from sklearn.externals import joblib
import json

model_name_list = json.loads('/home/wangxiyang/workspace/3dSeek/static/database/modelnet40/train_model_list.json')
lhl_kd_tree = joblib.load('/home/wangxiyang/workspace/3dSeek/methods/lhl/kd_tree/kd_tree.pkl')
smy_kd_tree = joblib.load('/home/wangxiyang/workspace/3dSeek/methods/lhl/kd_tree/kd_tree.pkl')
wxy_kd_tree = joblib.load('/home/wangxiyang/workspace/3dSeek/methods/lhl/kd_tree/kd_tree.pkl')


def search_by_feature(search_feature, method_name='wxy', data_set='modelnet40'):
    """
    search models according to the extracted feature
    :param method_name: 
    :param data_set: 
    :param search_feature: 
    :return search result
    """
    kd_tree = None
    if method_name == 'wxy':
        kd_tree = wxy_kd_tree
    elif method_name == 'smy':
        kd_tree = smy_kd_tree
    elif method_name == 'lhl':
        kd_tree = lhl_kd_tree
    dist, ind = kd_tree.query(search_feature, 50)
    return model_name_list[ind]

    #return ['bathtub_0007' for i in range(50)]


def k_d_tree_test():
    X = np.load(r'D:\Workspace\pyworkspace\deep-3d\data\saved-data\test-data.npy')
    tree = KDTree(X)
    dist, ind = tree.query(X[0], k=10)
    print(dist, ind)


def k_d_tree_dump():
    X = np.load('train_feature_modelnet40.npy')
    tree = KDTree(X)
    joblib.dump(tree, 'kd_tree/kd_tree.pkl')


if __name__ == '__main__':
    k_d_tree_dump()
