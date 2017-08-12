#! /usr/bin/env python

import tensorflow as tf
import numpy as np
import os
import time
import datetime
from my_cnn import MyCNN
import sys 
import matlab.engine
import os.path
import vgg19_trainable_sigmoid7 as vgg19
import utils

def fsize2str(fsize):
    if fsize > 1024*1024:
        result = str(round(fsize/(1024.0*1024),2))+'MB'
    else:
        result = str(round(fsize/(1024.0),2))+'KB'
    return result

def get_model_info(model_path):
    fs = open(model_path,'r')
    line = fs.readline()
    if len(line)<= 4:
        line = fs.readline()
    else:
        line = line[3:]
    nums = line.split()
    #print nums
    vertice_num = int(nums[0])
    edge_num = int(nums[1])
    #class_name = class_label[train_label1[i]]
    fsize = fsize2str(os.path.getsize(model_path))
    return vertice_num,edge_num,fsize	

def render_12p(model_path,dst_path):
	dst_path = os.path.join(dst_path,os.path.basename(model_path))[:-4]
	print(model_path,dst_path)
	eng = matlab.engine.start_matlab()
        eng.cd('/home/wangxiyang/workspace/3dSeek/methods/lhl')
	eng.shape_render(model_path,dst_path,nargout=0)
	eng.quit()
	img_path_list = [dst_path+'_'+str(i).zfill(3)+'.jpg' for i in range(1,13)]
	return img_path_list

def get_vgg_feature(img_path_list):
	images = tf.placeholder(tf.float32, [1, 224, 224, 3])
	true_out = tf.placeholder(tf.float32, [1, 40])
	train_mode = tf.placeholder(tf.bool)
	#gpu_options = tf.GPUOptions(per_process_gpu_memory_fraction=0.5)
	#sess = tf.Session(config=tf.ConfigProto(gpu_options=gpu_options))
	sess = tf.Session()
	vgg = vgg19.Vgg19_1('/home3/lhl/tensorflow-vgg-master-total/param/date0703epo10batchsize32_do05_12p_sigmoid7_total.npy',dropout=1)
	vgg.build(images, train_mode)
	sess.run(tf.global_variables_initializer())
	feature = np.zeros((len(img_path_list),4096),dtype=float)
	for i,img_path in enumerate(img_path_list):
		imgtest = utils.load_image(img_path)
        	imgbatch = imgtest.reshape((1, 224, 224, 3))
        	# test classification again, should have a higher probability about tiger
        	feature[i] = sess.run(vgg.relu7, feed_dict={images: imgbatch, train_mode: False})
        return feature

def get_feature_from_feature(vgg_feature):
	# Model Hyperparameters
	tf.flags.DEFINE_integer("embedding_dim", 4096, "Dimensionality of character embedding (default: 128)")
	tf.flags.DEFINE_string("filter_sizes", "1", "Comma-separated filter sizes (default: '3,4,5')")
	tf.flags.DEFINE_integer("num_filters", 128, "Number of filters per filter size (default: 128)")
	tf.flags.DEFINE_float("dropout_keep_prob", 0.5, "Dropout keep probability (default: 0.5)")
	tf.flags.DEFINE_float("l2_reg_lambda", 0.0, "L2 regularization lambda (default: 0.0)")

	# Training parameters
	tf.flags.DEFINE_integer("batch_size", 1, "Batch Size (default: 1)")
	tf.flags.DEFINE_integer("num_epochs", 200, "Number of training epochs (default: 200)")
	tf.flags.DEFINE_integer("evaluate_every", 100, "Evaluate model on dev set after this many steps (default: 100)")
	tf.flags.DEFINE_integer("checkpoint_every", 100, "Save model after this many steps (default: 100)")
	tf.flags.DEFINE_integer("num_checkpoints", 5, "Number of checkpoints to store (default: 5)")
	# Misc Parameters
	tf.flags.DEFINE_boolean("allow_soft_placement", True, "Allow device soft device placement")
	tf.flags.DEFINE_boolean("log_device_placement", False, "Log placement of ops on devices")

	FLAGS = tf.flags.FLAGS
	FLAGS._parse_flags()

	# Data Preparation
	# Training
	# ==================================================

	with tf.Graph().as_default():
	    session_conf = tf.ConfigProto(
	      allow_soft_placement=FLAGS.allow_soft_placement,
	      log_device_placement=FLAGS.log_device_placement)
	    sess = tf.Session(config=session_conf)
	    with sess.as_default():
		cnn = MyCNN(
		    sequence_length=12,
		    num_classes=40,
		    #vocab_size=len(vocab_processor.vocabulary_),
		    embedding_size=FLAGS.embedding_dim,
		    filter_sizes=list(map(int, FLAGS.filter_sizes.split(","))),
		    num_filters=FLAGS.num_filters,
		    l2_reg_lambda=FLAGS.l2_reg_lambda)
		# Initialize all variables
		#sess.run(tf.global_variables_initializer())

		saver = tf.train.Saver()
		saver.restore(sess,"/home3/lhl/shape_seek_interface/modeltotal.maxacc")

		def dev_step(x_batch, y_batch, writer=None):
		    """
		    Evaluates model on a dev set
		    """
		    feed_dict = {
		      cnn.input_x: x_batch,
		      cnn.input_y: y_batch,
		      cnn.dropout_keep_prob: 1.0
		    }
		    loss, accuracy, feature = sess.run(
			[cnn.loss, cnn.accuracy, cnn.h_pool_flat],
			feed_dict)
		    #time_str = datetime.datetime.now().isoformat()
		    #print("{}: step {}, loss {:g}, acc {:g}".format(time_str, step, loss, accuracy))
		    #if writer:
			#writer.add_summary(summaries, step)
		    return accuracy,feature

		x_batch = vgg_feature
		x_batch = np.reshape(x_batch,(1,12,4096))
		y_batch = [1 if 1 == k else 0 for k in range(40)]
		y_batch = np.reshape(y_batch,(1,40))
		_,test_feature_tcnn = dev_step(x_batch, y_batch)
        print('test_feature_tcnn')
	return test_feature_tcnn


def get_feature_from_image(img_path):
	vgg_feature1 = get_vgg_feature([img_path])
	vgg_feature = [vgg_feature1 for i in range(12)]
	return get_feature_from_feature(vgg_feature)

def get_feature_from_model(model_path):
	dst_path = '/home3/lhl/shape_seek_interface/tmp_image/'
	img_path_list = render_12p(model_path,dst_path)	
	vgg_feature = get_vgg_feature(img_path_list)
	return get_feature_from_feature(vgg_feature)

def get_feature_from_image_list(img_path_list):
	vgg_feature = get_vgg_feature(img_path_list)
        print('vgg-feature')
	if len(img_path_list) == 1:
		vgg_feature = [vgg_feature for i in range(12)]
	return get_feature_from_feature(vgg_feature)



if __name__ =='__main__':
	model_path = '/home3/lhl/ModelNet40/airplane/train/airplane_0067.off'
	pic_path = '/home3/lhl/modelnet40/modelnet40_total/train/airplane_0001_001.jpg'
	feature = get_feature_from_model(model_path)
	print(np.shape(feature))
	feature2 = get_feature_from_image(pic_path)
	print(np.shape(feature2))
