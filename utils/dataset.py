import os
import json
from utils.process_file import get_class_name_by_name

base_dir = os.path.join(os.getcwd(), 'static/database/modelnet10/test')
files = os.listdir(base_dir)
files.sort()
modelnames = [f[:-4] for f in files]
idx_map = {}
for idx, f in enumerate(modelnames):
    idx_map[f] = idx

def load_json(json_path):
    with open(json_path) as fp:
        return json.load(fp)

model_infos = load_json(os.path.join(os.getcwd(), 'static/database/modelnet10/test_info.json'))

def get_idx_by_name(modelname):
    if not modelname in idx_map:
        return -1
    else:
        return idx_map[modelname]


def get_modelnames_by_idx(idxs):
    return [modelnames[int(i)] for i in idxs]


def get_model_info(modelname):
    class_name = get_class_name_by_name(modelname)
    model_info = model_infos[class_name][modelname]
    return model_info


def get_model_url(modelname):
    return "/static/database/modelnet10/test/%s.off" % modelname