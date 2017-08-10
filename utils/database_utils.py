import os
import json

root_dir = '..'


def get_db_root_dir(db_name):
    db_name = db_name.lower()
    return os.path.join(root_dir, 'static', 'database', db_name)


def get_set_info(db_name):
    json_path = os.path.join(get_db_root_dir(db_name), 'train_info.json')
    with open(json_path) as p:
        info_dic = json.load(p)
    return info_dic


def get_model_url(dataset, model_name):
    pass


def get_view_path(dataset, model_name):
    pass


def get_view_url(dataset, model_name):
    pass


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
    parent_info = {'text': 'Parent 2', 'href': '#parent2', 'tags': ['0']}

    modelnet10_info = [get_set_info_from_dict(get_set_info('modelnet10')), parent_info]
    # modelnet10_info.append(parent_info)
    set_info['ModelNet10'] = modelnet10_info

    modelnet40_info = [get_set_info_from_dict(get_set_info('modelnet40')), parent_info]
    # modelnet40_info.append(parent_info)
    set_info['ModelNet40'] = modelnet40_info
    return json.dumps(set_info)


def get_set_names_json():
    sets = ["ModelNet", "ShapeNet"]
    info_dic = {"sets": sets}
    sub_dic = {"ModelNet": ["ModelNet10", "ModelNet40"], "ShapeNet": ["ShapeNet-Core", "ShapeNet-Sem"]}
    info_dic['subsets'] = sub_dic
    return json.dumps(info_dic)


def get_class_detail(dataset_name, class_name, start, size):
    set_info = get_set_info(dataset_name)
    class_info = set_info[class_name.lower()]
    return json.dumps(class_info)
