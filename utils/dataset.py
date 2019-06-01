import os

base_dir = os.path.join(os.getcwd(), 'static/database/modelnet10/test')
files = os.listdir(base_dir)
files.sort()
files = [f[:-4] for f in files]
idx_map = {}
for idx, f in enumerate(files):
    idx_map[f] = idx


def get_idx_by_name(modelname):
    if not modelname in idx_map:
        return -1
    else:
        return idx_map[modelname]
