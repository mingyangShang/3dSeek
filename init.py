import numpy as np
from sklearn.neighbors import KDTree
from sklearn.externals import joblib
import os
import methods.wxy.info as wxy
import methods.smy.info as smy



def k_d_tree_dump(src_feature, dst_tree_path):

    X = src_feature
    print(X.shape)
    tree = KDTree(X)
    dist, ind = tree.query(X[0:1], 10)
    ind = ind.reshape([-1])
    print(ind)
    name_list = [int(i) for i in ind]
    print(name_list)
    joblib.dump(tree, dst_tree_path)


def dump_all():
    k_d_tree_dump(wxy.features, os.path.join(os.getcwd(), 'static/database/wxy/kd_tree.pkl'))
    k_d_tree_dump(smy.features, os.path.join(os.getcwd(), 'static/database/smy/kd_tree.pkl'))

    k_d_tree_dump(wxy.features_us, os.path.join(os.getcwd(), 'static/database/wxy/kd_tree_us.pkl'))
    k_d_tree_dump(smy.features_search, os.path.join(os.getcwd(), 'static/database/smy/kd_tree_us.pkl'))


if __name__ == '__main__':
    dump_all()
