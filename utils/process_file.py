import random, string

IMG_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif']
SHAPE_EXTENSIONS = ['off', 'obj']


def get_file_extensions(filename):
    if '.' in filename:
        return filename.rsplit('.', 1)[1]
    else:
        return ''


def get_file_type(filename):
    file_extension = get_file_extensions(filename)
    if file_extension in IMG_EXTENSIONS:
        return 'IMG'
    if file_extension in SHAPE_EXTENSIONS:
        return 'SHAPE'
    return 'TEXT'


def random_str(length=8):
    return ''.join([random.choice(string.ascii_letters) for i in range(length)])