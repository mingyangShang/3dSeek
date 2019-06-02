import numpy as np
import os
from utils.dataset import get_idx_by_name, get_modelnames_by_idx, get_model_info, get_model_url
from utils.process_file import get_all_class_names, get_class_name_by_name
from utils.search_engineer import search_by_feature

base_url = '/static/database/wxy/views/test/'
view_num = 20
base_dir = os.path.join(os.getcwd(), 'static/database/wxy')

features = np.load(os.path.join(base_dir, 'features', 'fc_feature_mat_10_test.npy'))
probs = np.load(os.path.join(base_dir, 'probs', 'fc_feature_mat_10_test_prob.npy'))

# need to be change
features_us = np.load(os.path.join(base_dir, 'features', 'fc_feature_mat_10_test.npy'))
probs_us = np.load(os.path.join(base_dir, 'probs', 'fc_feature_mat_10_test_label.npy'))

supervised_method_name = "3dview"

def get_view_urls_by_modelname(modelname):
    view_urls = []
    for i in range(view_num):
        filename = "%s_%03d.jpg" % (modelname, i+1)
        url = {'view_url':base_url + filename, 'view_index':i}
        view_urls.append(url)
    return {'n_views':view_num, 'imgs':view_urls}


def get_feature_by_name(modelname, method_name):
    idx = get_idx_by_name(modelname)
    if modelname == supervised_method_name:
        return features[idx].tolist()
    else:
        return features_us[idx].tolist()


def get_prob_by_name(modelname, method_name):
    idx = get_idx_by_name(modelname)
    if method_name == supervised_method_name:
        return probs[idx].tolist()
    else:
        return probs_us[idx].tolist()


def get_search_result(modelname, method_name):
    feature = get_feature_by_name(modelname, method_name)
    idxs, dists = search_by_feature(feature)
    res_names = get_modelnames_by_idx(idxs)
    retrieval_res = {"total_count": 50, "curr_count": 50, "curr_page":1}
    retrieval_models = []
    for i in range(len(res_names)):
        name = res_names[i]
        model_info = get_model_info(name)
        views = get_view_urls_by_modelname(name)
        view_urls = [v['view_url'] for v in views['imgs']]
        meta_info = {"dataset":"modelnet", "size":model_info['file_size'], "name":name,
                     "class_name":model_info['class_name'], "edge_num":model_info['edge_num'],
                     "model_url":get_model_url(name), "view_urls":view_urls,
                     "dist":dists[i], "feature":feature, "feature_dim":len(feature), "download_url":"null"}
        retrieval_models.append(meta_info)
    retrieval_res['models'] = retrieval_models
    return retrieval_res




def get_total_info(modelname, method_name):
    total_info = {}
    total_info['views'] = get_view_urls_by_modelname(modelname)

    # pack feature
    feature = get_feature_by_name(modelname, method_name)
    feature_info = {'feature':feature, 'feature_dim':len(feature)}
    total_info['features'] = feature_info

    # pack prob
    prob = get_prob_by_name(modelname, method_name)
    prob_info = {}
    prob_info['class_num'] = 10
    prob_info['probs'] = {}
    prob_info['method'] = method_name
    prob_info['class_name'] = get_class_name_by_name(modelname)
    class_names = get_all_class_names()
    for i in range(10):
        prob_info['probs'][class_names[i]] = prob[i]
    total_info['probs'] = [prob_info]

    total_info['retrieval'] = get_search_result(modelname, method_name)
    return total_info