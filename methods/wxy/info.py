import numpy as np
import os
from utils.dataset import get_idx_by_name
from utils.process_file import get_all_class_names

base_url = '/static/database/wxy/views/test/'
view_num = 20
base_dir = os.path.join(os.getcwd(), 'static/database/wxy')

features = np.load(os.path.join(base_dir, 'features', 'fc_feature_mat_10_test.npy'))
probs = np.load(os.path.join(base_dir, 'probs', 'fc_feature_mat_10_test_prob.npy'))


def get_view_urls_by_modelname(modelname):
    view_urls = []
    for i in range(view_num):
        filename = "%s_%03d.jpg" % (modelname, i+1)
        url = {'view_url':base_url + filename, 'view_index':i}
        view_urls.append(url)
    return {'n_views':view_num, 'imgs':view_urls}


def get_feature_by_name(modelname):
    idx = get_idx_by_name(modelname)
    return features[idx].tolist()


def get_prob_by_name(modelname):
    idx = get_idx_by_name(modelname)
    return probs[idx].tolist()


def get_total_info(modelname):
    total_info = {}
    total_info['views'] = get_view_urls_by_modelname(modelname)

    # pack feature
    feature = get_feature_by_name(modelname)
    feature_info = {'feature':feature, 'feature_dim':len(feature)}
    total_info['features'] = feature_info

    # pack prob
    prob = get_prob_by_name(modelname)
    prob_info = {}
    prob_info['class_num'] = 10
    prob_info['probs'] = {}
    prob_info['method'] = 'on'
    class_names = get_all_class_names()
    for i in range(10):
        prob_info['probs'][class_names[i]] = prob[i]
    total_info['probs'] = [prob_info]

    return total_info