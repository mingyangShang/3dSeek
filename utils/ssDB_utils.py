import numpy as np
import json

def get_dataset_list():
    dataset_list = ['modelnet40','modelnet10', 'shapenet55']
    return dataset_list

def get_class_name(dataset_name):
    class_names = {}
    class_names['modelnet40'] = ['airplane','bathtub','bed','bench','bookshelf','bottle','bowl','car','chair','cone','cup','curtain','desk','door','dresser','flowerpot',\
                   'glassbox','guitar','keyboard','lamp','laptop','mantel','monitor','nightstand','person','piano','plant','radio','rangehood','sink',\
                   'sofa','stairs','stool','table','tent','toilet','tvstand','vase','wardrobe','xbox']
    class_names['modelnet10'] = ['bathtub','bed','chair','desk', 'dresser','monitor','nightstand','sofa','table','toilet']
    class_names['shapenet55'] = [4074963,2871439,3207941,2747177,2801938,3991062,3513137,3797390,\
             2773838,3624134,4004475,2691156,2818832,2876657,3593526,2946921,\
             2880940,2933112,3337140,3710193,4379243,2942699,2958343,3001627,\
             4256520,2828884,3691459,3046257,3085013,3211117,3948459,4090263,\
             3636649,3642806,3761084,2992529,4401088,3928116,4530566,4460130,\
             4099429,3790512,4225987,3467517,3261776,3759954,4330267,3325088,\
             4554684,4468005,2954340,2808440,3938244,2924116,2843684]
    return class_names[dataset_name]

def get_train_file_list(dataset_name):
    train_file_info_path = '/train_info.json'
    f_path = dataset_name+train_file_info_path
    info = json.load(open(f_path,'r'))
    return info

def get_test_file_list(dataset_name):
    test_file_info_path =  '/test_info.json'
    f_path = dataset_name+test_file_info_path
    info = json.load(open(f_path,'r'))
    return info

def get_model_path(model_name, dataset, istrain = 'train'):
    paths = {'modelnet40':'../ModelNet40/','modelnet10':'../ModelNet10/','shapenet55':'../ShapeNet55/'}
    return paths[dataset]+model_name+'/'+istrain+'.off'
    
def get_pics_path(model_name, dataset, istrain = 'train'):
    paths = {'modelnet40':'../modelnet40_total_v2/','modelnet10':'../modelnet10_v2/','shapenet55':'../shapenet55v1/'}
    pic_list = [paths[dataset]+istrain+'/'+model_name+'_'+str(i).zfill(3)+'.jpg' for i in range(1,13)]
    return pic_list

    
if __name__ =='__main__':
    dataset_list = get_dataset_list()
    dataset_name = dataset_list[0]
    print(get_class_name(dataset_name))
    traininfo = get_train_file_list(dataset_name)
    testinfo = get_test_file_list(dataset_name)
    print(get_model_path('airplane_0001',dataset_name))
    print(get_pics_path('airplane_0627',dataset_name))