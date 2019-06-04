import numpy as np
from sklearn.neighbors import KDTree
from sklearn.externals import joblib
import json
import os

smy_supervised_method_name = "SeqViews2SeqLabels"
wxy_supervised_method_name = "3DViewGraph"

wxy_kd_tree = joblib.load(os.path.join(os.getcwd(), 'static/database/wxy/kd_tree.pkl'))
smy_kd_tree = joblib.load(os.path.join(os.getcwd(), 'static/database/smy/kd_tree.pkl'))

wxy_kd_tree_us = joblib.load(os.path.join(os.getcwd(), 'static/database/wxy/kd_tree_us.pkl'))
smy_kd_tree_us = joblib.load(os.path.join(os.getcwd(), 'static/database/smy/kd_tree_us.pkl'))

def load_json(json_path):
    with open(json_path) as fp:
        return json.load(fp)


def search_by_feature(search_feature, author_name='wxy', method_name='3DViewGraph', data_set='modelnet40'):
    kd_tree = None
    search_feature = np.array(search_feature)
    if author_name == 'wxy':
        if method_name == wxy_supervised_method_name:
            kd_tree = wxy_kd_tree
        else:
            kd_tree = wxy_kd_tree_us
    elif author_name == 'smy':
        if method_name == smy_supervised_method_name:
            kd_tree = smy_kd_tree
        else:
            kd_tree = smy_kd_tree_us

    if len(search_feature.shape) == 1:
        search_feature = np.expand_dims(search_feature, axis=0)
    print(search_feature.shape)
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

    X = np.load(os.path.join(os.getcwd(), 'static/database/wxy/features/hvp_modelnet10_test_prob.npy'))
    print(X.shape)
    tree = KDTree(X)
    dist, ind = tree.query(X[0:1], 10)
    ind = ind.reshape([-1])
    print(ind)
    name_list = [int(i) for i in ind]
    print(name_list)

    joblib.dump(tree, os.path.join(os.getcwd(),'static\database\wxy\kd_tree_us.pkl'))


if __name__ == '__main__':
    k_d_tree_dump()
