import methods.lhl.feature_extract as lhl
import methods.smy.feature_extract as smy
import methods.wxy.feature_extract as wxy


def get_feature(file_path, file_type, search_method, dataset='modelnet40'):
    """
    get extracted feature from file 
    :param file_path: 
    :param file_type: 
    :param search_method: 
    :return: feature of the file
    """
    feature = None
    if file_type == 'IMG':
        if search_method == 'lhl':
            feature = lhl.get_feature_from_image(file_path)
        elif search_method == 'smy':
            feature = smy.get_feature_from_image(file_path)
        elif search_method == 'wxy':
            feature = wxy.get_feature_from_image(file_path, dataset)
    if file_type == 'SHAPE':
        if search_method == 'lhl':
            feature = lhl.get_feature_from_model(file_path)
        elif search_method == 'smy':
            feature = smy.get_feature_from_model(file_path)
        elif search_method == 'wxy':
            feature = wxy.get_feature_from_model(file_path, dataset)
    return feature