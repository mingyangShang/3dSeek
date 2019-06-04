import numpy as np
import os
from utils.dataset import get_idx_by_name, get_modelnames_by_idx, get_model_info, get_model_url
from utils.process_file import get_all_class_names, get_class_name_by_name
from utils.search_engineer import search_by_feature

base_url = '/static/database/smy/views/test/'
view_num = 12


base_dir = os.path.join(os.getcwd(), 'static/database/smy')

attns = np.load(os.path.join(base_dir, 'features', 'modelnet10_test_attn.npy'))
features = np.load(os.path.join(base_dir, 'features', 'modelnet10_test_hidden.npy'))
# need to be change
features_us = np.load(os.path.join(base_dir, 'features', 'smy_svm_prob.npy'))

probs = np.load(os.path.join(base_dir, 'probs', 'modelnet10_test_probs.npy'))
# need to be change
probs_us = np.load(os.path.join(base_dir, 'probs', 'smy_svm_prob.npy'))

supervised_method_name = "SeqViews2SeqLabels"

base_recon_url = '/static/database/smy/views/test/'


def get_view_urls_by_modelname(modelname):
    view_urls = []
    for i in range(view_num):
        filename = "%s_%03d.jpg" % (modelname, i+1)
        url = {'view_url':base_url + filename, 'view_index':i}
        view_urls.append(url)
    return {'n_views':view_num, 'imgs':view_urls}


def get_feature_by_name(modelname, method_name):
    idx = get_idx_by_name(modelname)
    if method_name == supervised_method_name:
        return features[idx].tolist()
    else:
        return features_us[idx].tolist()


def get_prob_by_name(modelname, method_name):
    idx = get_idx_by_name(modelname)
    if method_name == supervised_method_name:
        return probs[idx].tolist()
    else:
        return probs_us[idx].tolist()


def get_model_info_by_name(modelname, method_name):
    feature = get_feature_by_name(modelname, method_name)
    model_info = get_model_info(modelname)
    views = get_view_urls_by_modelname(modelname)
    view_urls = [v['view_url'] for v in views['imgs']]
    meta_info = {"dataset": "modelnet", "size": model_info['file_size'], "name": modelname,
                 "class_name": model_info['class_name'], "edge_num": model_info['edge_num'],
                 "model_url": get_model_url(modelname), "view_urls": view_urls, "vertice_num":model_info['vertice_num'],
                 "feature": feature, "feature_dim": len(feature), "download_url": "null"}
    return meta_info


def get_search_result(modelname, method_name):
    feature = get_feature_by_name(modelname, method_name)
    idxs, dists = search_by_feature(feature, 'smy', method_name)
    res_names = get_modelnames_by_idx(idxs)
    retrieval_res = {"total_count": 48, "curr_count": 48, "curr_page":1}
    retrieval_models = []
    for i in range(1, len(res_names)-1):
        name = res_names[i]
        meta_info = get_model_info_by_name(name, method_name)
        meta_info['dist'] = dists[i]
        retrieval_models.append(meta_info)
    retrieval_res['models'] = retrieval_models
    return retrieval_res


def get_attn_by_name(modelname, method_name='null'):
    idx = get_idx_by_name(modelname)
    return attns[idx]


def get_attention_info(modelname, method_name):
    attn_vals = get_attn_by_name(modelname)
    attn_infos = []
    for idx in range(10):
        attn_info = {"class_names":get_all_class_names(), "class_idx":idx}
        attn_val = attn_vals[idx]
        mi_idx, ma_idx = int(np.argmin(attn_val)), int(np.argmax(attn_val))
        attn_info['attn_weights'] = attn_val.tolist()
        mi_url = base_url + "%s_%03d.jpg" % (modelname, mi_idx + 1)
        ma_url = base_url + "%s_%03d.jpg" % (modelname, ma_idx + 1)
        attn_info['max'] = {'attn_weight':attn_info['attn_weights'][ma_idx], 'view_url':ma_url}
        attn_info['min'] = {'attn_weight':attn_info['attn_weights'][mi_idx], 'view_url':mi_url}
        attn_infos.append(attn_info)
    return attn_infos


def get_view_recon(modelname):
    view_recon_info = []
    for i in range(view_num):
        meta_info = {}
        neighs = []
        for ni in [-1, 1]:
            filename = "%s_%03d.jpg" % (modelname, (ni + view_num + i) % 12)
            neighs.append(base_url + filename)
        filename = "%s_%03d.jpg" % (modelname, i)
        meta_info['gt_center'] = base_url + filename
        meta_info['neighbours'] = neighs
        meta_info['pred_center'] = base_recon_url + filename
        view_recon_info.append(meta_info)
    return view_recon_info


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
    class_idx = np.argmax(np.array(prob))
    class_names = get_all_class_names()
    prob_info['class_name'] = class_names[class_idx]
    print('class idx', class_idx)
    print(prob)
    for i in range(10):
        prob_info['probs'][class_names[i]] = prob[i]
    total_info['probs'] = [prob_info]

    total_info['retrieval'] = get_search_result(modelname, method_name)
    total_info['attns'] = get_attention_info(modelname, '')
    total_info['model_url'] = get_model_url(modelname)
    if method_name != supervised_method_name:
        total_info['center_view_recon'] = get_view_recon(modelname)
    return total_info
