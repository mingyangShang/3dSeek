from flask import Flask, render_template, request, url_for, send_from_directory, send_file
from utils.process_file import random_str, get_file_type, get_file_extensions, get_file_size
from utils.search_engineer import search_by_feature, search_by_text
from utils.feature_extract import get_feature
import os
import json
import utils.database_utils as db_utils

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

db_utils.root_dir = app.root_path

app.cache_dic = {}


@app.route('/download')
def download_file():
    dataset = request.args.get('dataset')
    model_name = request.args.get('model_name')
    class_name = model_name.split('_')[0]
    dataset = dataset.lower()
    model_folder = os.path.join(app.root_path, 'static', 'database', dataset, 'models', class_name, 'train')
    return send_file(os.path.join(model_folder, model_name + '.off'), as_attachment=True)


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)


@app.route('/api/set/names', methods=['GET'])
def get_set_names():
    return db_utils.get_set_names_json()


@app.route('/api/set/classes', methods=['GET'])
def get_set_classes():
    return db_utils.get_set_info_json()


@app.route('/api/class/detail', methods=['GET'])
def get_class_details():
    """
    GET parameters:
    -- dataset: dataset name
    -- class_name: can be 'All' or other class names
    -- page: the show page
    -- page_size: size of one page
    :return: 
    """
    dataset = request.args.get('dataset')
    class_name = request.args.get('class_name')
    page = request.args.get('page')
    page_size = request.args.get('page_size')
    if page is None:
        page = 1
    else:
        page = int(page)
    if page_size is None:
        page_size = 48
    else:
        page_size = int(page_size)
    return db_utils.get_class_detail(dataset, class_name, page, page_size)


@app.route('/search', methods=['POST'])
def search():
    search_type = request.form.get('type')
    search_method = request.form.get('method')
    # dataset = request.form.get('dataset')
    dataset = "modelnet40"
    result_json = {}
    print(search_type)
    if search_type == 'file':
        print('aaaaaa')
        upload_file = request.files['file']
        file_type = get_file_type(upload_file.filename)
        filename = random_str() + '.' + get_file_extensions(upload_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        upload_file.save(file_path)
    if search_type == 'url':
        file_url = request.form.get('url')
        filename = db_utils.download_file(file_url, app.config['UPLOAD_FOLDER'])
        file_type = get_file_extensions(filename)
        if filename is None:
            result_json['success'] = False
            result_json['info'] = "Invalid url"
            return json.dumps(result_json)
        else:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file_type = get_file_extensions(filename)
    # try:
    #     feature = get_feature(file_path, file_type, search_method, dataset)
    # except Exception:
    #     result_json['success'] = False
    #     result_json['info'] = "feature error"
    #     return json.dumps(result_json)
    feature = [0.1 * i for i in range(128)]
    print(feature)
    result_list = search_by_feature(feature, search_method, dataset)
    search_key = filename.split('.')[0]
    file_size = get_file_size(file_path)

    file_info = {'file_type': file_type, "file_name": filename, "file_path": file_path, "file_size": file_size,
                 "file_url": url_for('uploaded_file', filename=filename), 'search_key': search_key, "feature": feature,
                 "feature_dim": len(feature)}
    if file_type == 'SHAPE':
        file_info['view_urls'] = [url_for('uploaded_file', filename='%s_%03d.jpg' % (search_key, i)) for i in
                                  range(1, 13)]
        file_info['vertice_num'] = 3455
        file_info['edge_num'] = 2344
    print(file_info)
    app.cache_dic[search_key] = {'result_list': result_list, 'dataset': dataset, 'file_info': file_info}

    result_json['success'] = True
    result_json['result_url'] = '/search-result?key=%s' % search_key
    print(result_json)
    return json.dumps(result_json)


@app.route('/search-result')
def search_result():
    search_key = request.args.get('key')
    info_dic = app.cache_dic[search_key]['file_info']
    print(info_dic)
    return render_template('search_result.html', info=info_dic)


@app.route('/api/search/detail')
def search_detail():
    search_key = request.args.get('search_key')
    page = request.args.get('page')
    page_size = request.args.get('page_size')
    if page is None:
        page = 1
    else:
        page = int(page)
    if page_size is None:
        page_size = 48
    else:
        page_size = int(page_size)
    search_result = app.cache_dic[search_key]
    return db_utils.get_search_result_detail(search_result['dataset'], search_result['result_list'], page, page_size)


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.route('/experiment-result')
def experiment_result():
    return render_template('experiment_result.html')


@app.route('/middle-result')
def middle_result():
    return render_template('middle_result.html')


@app.route('/viewer')
def model_view():
    search_key = request.args.get('key')
    if search_key is not None:
        file_info = app.cache_dic[search_key]['file_info']
        model_info = {}
        model_info['size'] = file_info['file_size']
        model_info['name'] = file_info['file_name']
        model_info['model_url'] = file_info['file_url']
        model_info['view_urls'] = file_info['view_urls']
        model_info['vertice_num'] = file_info['vertice_num']
        model_info['edge_num'] = file_info['edge_num']
        model_info['featrue'], model_info['feature_dim'] = file_info['feature'], file_info['feature_dim']
    else:
        dataset = request.args.get('dataset')
        class_name = request.args.get('class_name')
        model_name = request.args.get('model_name')
        model_info = db_utils.get_model_info(dataset, class_name, model_name)
        feature = [0.1 * i for i in range(128)]
        model_info['feature'] = feature
        model_info['feature_dim'] = len(feature)
    print(model_info)

    return render_template('view-model.html', model=model_info)


@app.route('/team')
def team_info():
    return render_template('team.html')


if __name__ == '__main__':
    # app.run()
    app.run(host='0.0.0.0', port=8610)
