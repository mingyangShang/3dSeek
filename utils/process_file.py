import random, string
import json
import os

IMG_EXTENSIONS = ['png', 'jpg', 'gif']
SHAPE_EXTENSIONS = ['off', 'obj']

root_dir = '..'
name_2_class = {'tv': 'tv_stand', 'night': 'night_stand', 'flower': 'flower_pot', 'glass': 'glass_box',
                'range': 'range_hood'}

classes = ['bathtub', 'bed', 'chair', 'desk', 'dresser', 'monitor', 'night_stand', 'sofa', 'table', 'toilet']


def get_all_class_names():
    return classes


def get_model_name(file_name):
    file_ext = get_file_extensions(file_name)
    model_name = ''
    if file_ext in SHAPE_EXTENSIONS:
        model_name = file_name[:-4]
    if file_ext in IMG_EXTENSIONS:
        model_name = file_name[:-8]
    return model_name


def get_file_extensions(filename):
    if '.' in filename:
        return filename.rsplit('.', 1)[1]
    else:
        return ''


def get_class_name_by_name(model_name):
    raw_class_name = model_name.split('_')[0]
    if raw_class_name in name_2_class.keys():
        raw_class_name = name_2_class[raw_class_name]
    return raw_class_name


def get_file_size(filepath):
    file_size = os.path.getsize(filepath)
    return fsize2str(file_size)


def fsize2str(fsize):
    if fsize > 1024 * 1024:
        result = str(round(fsize / (1024.0 * 1024), 2)) + 'MB'
    else:
        result = str(round(fsize / (1024.0), 2)) + 'KB'
    return result


def get_model_info(model_path):
    fs = open(model_path, 'r')
    line = fs.readline()
    if len(line) <= 4:
        line = fs.readline()
    else:
        line = line[3:]
    nums = line.split()
    # print nums
    vertice_num = int(nums[0])
    edge_num = int(nums[1])
    # class_name = class_label[train_label1[i]]
    fsize = fsize2str(os.path.getsize(model_path))
    return vertice_num, edge_num, fsize


def get_file_type(filename):
    file_extension = get_file_extensions(filename).lower()
    if file_extension in IMG_EXTENSIONS:
        return 'IMG'
    if file_extension in SHAPE_EXTENSIONS:
        return 'SHAPE'
    return 'NONE'


def random_str(length=9):
    return ''.join([random.choice(string.ascii_letters) for i in range(length)])


if __name__ == '__main__':
    pass
