import numpy as np
from sklearn.neighbors import KDTree


def search_by_text(search_text, data_set='modelnet40'):
    """
    search models according to the input text
    :param data_set: 
    :param search_text: 
    :return search result:  
    """
    pass


def search_by_feature(search_feature, method_name='wxy', data_set='modelnet40'):
    """
    search models according to the extracted feature
    :param method_name: 
    :param data_set: 
    :param search_feature: 
    :return search result
    """
    pass

"""
检索算法使用K-D树进行匹配
"""
def k_d_tree_test():

    X = np.load(r'D:\Workspace\pyworkspace\deep-3d\data\saved-data\test-data.npy')
    tree = KDTree(X)
    dist, ind = tree.query(X[0], k=10)
    print(dist, ind)


if __name__ == '__main__':
    k_d_tree_test()
