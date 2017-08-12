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
    kb_size = 1024
    mb_size = kb_size * 1024
    if file_size // mb_size > 0:
        return "%.2fMB" % (file_size / mb_size)
    else:
        return "%.2fKB" % (file_size / kb_size)


def get_file_type(filename):
    file_extension = get_file_extensions(filename)
    if file_extension in IMG_EXTENSIONS:
        return 'IMG'
    if file_extension in SHAPE_EXTENSIONS:
        return 'SHAPE'
    return 'NONE'


def random_str(length=9):
    return ''.join([random.choice(string.ascii_letters) for i in range(length)])


if __name__ == '__main__':
    pass
