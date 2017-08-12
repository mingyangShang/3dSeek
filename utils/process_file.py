import random, string
import json
import os

IMG_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif']
SHAPE_EXTENSIONS = ['off', 'obj']

root_dir = '..'


def get_file_extensions(filename):
    if '.' in filename:
        return filename.rsplit('.', 1)[1]
    else:
        return ''


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
