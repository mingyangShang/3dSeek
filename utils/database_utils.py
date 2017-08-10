import os
import json

root_dir = '..'


def get_db_root_dir(db_name):
    db_name = db_name.lower()
    return os.path.join(root_dir, 'static', 'database', db_name)


def get_set_info(db_name):
    db_name = db_name.lower()
    json_path = os.path.join(get_db_root_dir(db_name), 'train_info.json')
    with open(json_path) as p:
        info_dic = json.load(p)
    return info_dic


def get_model_url(dataset, model_name):
    class_name = model_name.split('_')[0]
    return "/static/database/%s/models/%s/train/%s.off" % (dataset, class_name, model_name)


def get_view_urls(dataset, model_name):
    # class_name = model_name.split('_')[0]
    urls = []
    for i in range(12):
        urls.append("/static/database/%s/views/train/%s_%03d.jpg" % (dataset, model_name, i + 1))
    return urls


def get_model_feature(dataset, model_name):
    return '***************'


def get_set_info_from_dict(json_dict):
    info_dic = json_dict
    nodes = []
    counter = 0
    for key in info_dic.keys():
        class_dic = {}
        class_dic['text'] = key
        class_dic['href'] = '#' + key
        model_num = len(info_dic[key].keys())
        counter += model_num
        class_dic['tags'] = [str(model_num)]
        nodes.append(class_dic)
    set_info = {'nodes': nodes}
    set_info['text'] = 'All'
    set_info['href'] = '#all'
    set_info['tags'] = [str(counter)]
    return set_info


def get_set_info_json():
    set_info = {}
    # parent_info = {'text': 'Parent 2', 'href': '#parent2', 'tags': ['0']}

    modelnet10_info = [get_set_info_from_dict(get_set_info('modelnet10'))]
    set_info['ModelNet10'] = modelnet10_info

    modelnet40_info = [get_set_info_from_dict(get_set_info('modelnet40'))]
    set_info['ModelNet40'] = modelnet40_info
    return json.dumps(set_info)


def get_set_names_json():
    sets = ["ModelNet", "ShapeNet"]
    info_dic = {"sets": sets}
    sub_dic = {"ModelNet": ["ModelNet10", "ModelNet40"], "ShapeNet": ["ShapeNet-Core", "ShapeNet-Sem"]}
    info_dic['subsets'] = sub_dic
    return json.dumps(info_dic)


def get_class_detail(dataset_name, class_name, start=0, size=100):
    dataset_name = dataset_name.lower()
    set_info = get_set_info(dataset_name)
    if class_name.lower() == 'all':
        class_info = {}
        for key in set_info.keys():
            for key2 in set_info[key]:
                class_info[key2] = set_info[key][key2]
    else:
        class_info = set_info[class_name.lower()]
    model_names = [key for key in class_info.keys()]
    model_names.sort()
    models = []
    for model_name in model_names:
        info_dic = class_info[model_name]
        info_dic['name'] = model_name
        info_dic['model_url'] = get_model_url(dataset_name, model_name)
        info_dic['view_urls'] = get_view_urls(dataset_name, model_name)
        models.append(info_dic)
    return json.dumps(models)


def get_search_result_detail(dataset_name, model_list, start=0, size=100):
    set_info = get_set_info(dataset_name)
    models = []
    for model_name in model_list:
        class_name = model_list.split('_')[0]
        info_dic = set_info[class_name][model_name]
        info_dic['name'] = model_name
        info_dic['model_url'] = get_model_url(dataset_name, model_name)
        info_dic['view_urls'] = get_view_urls(dataset_name, model_name)
        models.append(info_dic)
    return json.dumps(models)

if __name__ == '__main__':
    res = get_model_url('modelnet10', 'airplane_0001')
    print(res)
    res = get_view_urls('modelnet10', 'toilet_0358')
    print(res)
