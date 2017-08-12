import methods.lhl.feature_extract as lhl
import methods.smy.feature_extract as smy
import methods.wxy.feature_extract as wxy


def get_feature(image_list, file_type, search_method, dataset='modelnet40'):
    """
    get extracted feature from file 
    :param file_path: 
    :param file_type: 
    :param search_method: 
    :return: feature of the file
    """
    feature = None
    #search_method = 'lhl'

    if search_method == 'lhl':
        feature = lhl.get_feature_from_image_list(image_list)
    elif search_method == 'smy':
        feature = smy.get_feature_from_image_list(image_list)
    elif search_method == 'wxy':
        feature = wxy.get_feature_from_image_list(image_list)
    feature = feature.reshape(-1).tolist()
    return feature
