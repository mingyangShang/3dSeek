import numpy as np
from sklearn.neighbors import KDTree
from sklearn.externals import joblib
import json
import os

wxy_kd_tree = joblib.load(os.path.join(os.getcwd(), 'static/database/wxy/kd_tree.pkl'))
smy_kd_tree = joblib.load(os.path.join(os.getcwd(), 'static/database/wxy/kd_tree.pkl'))


def load_json(json_path):
    with open(json_path) as fp:
        return json.load(fp)


def search_by_feature(search_feature, author_name='wxy', method_name='3dview', data_set='modelnet40'):
    """
    search models according to the extracted feature
    :param method_name: 
    :param data_set: 
    :param search_feature: 
    :return search result
    """
    kd_tree = None
    search_feature = np.array(search_feature)
    if author_name == 'wxy':
        kd_tree = wxy_kd_tree
    elif author_name == 'smy':
        kd_tree = smy_kd_tree
    if len(search_feature.shape) == 1:
        search_feature = np.expand_dims(search_feature, axis=0)
    dist, ind = kd_tree.query(search_feature, 50)
    ind = ind.reshape([-1])
    dist = dist.reshape([-1])
    idx_list = [int(i) for i in ind]
    dist_list = [d for d in dist]
    return idx_list, dist_list


def k_d_tree_test():
    X = np.load(r'D:\Workspace\pyworkspace\deep-3d\data\saved-data\test-data.npy')
    tree = KDTree(X)
    dist, ind = tree.query(X[0], k=10)
    print(dist, ind)


def k_d_tree_dump():
    X = np.load(r'F:\实验室\毕业\毕设\演示demo\3dSeek\static\database\wxy\features\fc_feature_mat_10_test.npy')
    print(X.shape)
    tree = KDTree(X)
    dist, ind = tree.query(X[0:1], 10)
    ind = ind.reshape([-1])
    print(ind)
    name_list = [int(i) for i in ind]
    print(name_list)
    joblib.dump(tree, r'F:\实验室\毕业\毕设\演示demo\3dSeek\static\database\wxy\kd_tree.pkl')


if __name__ == '__main__':
    k_d_tree_dump()
