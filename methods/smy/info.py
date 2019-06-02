import numpy as np
import os
from utils.dataset import get_idx_by_name

base_url = '/static/database/smy/views/test/'
view_num = 12
base_dir = os.path.join(os.getcwd(), 'static/database/smy/features')


def get_view_urls_by_name(modelname):
    view_urls = []
    for i in range(view_num):
        filename = "%s_%03d.jpg" % (modelname, i+1)
        url = {'view_url':base_url + filename, 'view_index':i}
        view_urls.append(url)
    return {'n_views':view_num, 'imgs':view_urls}


def get_feature_by_name(modelname):
    pass


def get_total_info(modelname):
    total_info = {}
    total_info['views'] = get_view_urls_by_name(modelname)
    return total_info

