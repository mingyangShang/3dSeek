from flask import Flask, render_template, request, url_for, send_from_directory, send_file
from utils.process_file import random_str, get_file_type, get_file_extensions
from utils.search_engineer import search_by_feature, search_by_text
from utils.feature_extract import get_feature
import os
import json
import utils.database_utils as db_utils
import base64

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
    search_type = request.form['type']
    search_method = request.form['method']
    dataset = request.form['dataset']
    result_json = {}
    print(search_type)
    if search_type == 'file':
        upload_file = request.files['file']
        file_type = get_file_type(upload_file.filename)
        filename = random_str() + '.' + get_file_extensions(upload_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        upload_file.save(file_path)
    if search_type == 'url':
        file_url = request.form['url']
        filename = db_utils.download_file(file_url, app.config['UPLOAD_FOLDER'])
        file_type = get_file_extensions(filename)
        if filename is None:
            result_json['success'] = False
            result_json['info'] = "Invalid url"
            return json.dumps(result_json)
        else:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        feature = get_feature(file_path, file_type, search_method, dataset)
    except Exception:
        result_json['success'] = False
        result_json['info'] = "feature error"
        return json.dumps(result_json)
    result_list = search_by_feature(feature, search_method, dataset)
    search_key = base64.urlsafe_b64decode(filename)
    app.cache_dic[search_key] = {'result_list': result_list, 'dataset': dataset, 'file_path': file_path}
    result_json['success'] = True
    result_json['result_url'] = '/search-result?key=%s' % search_key
    # result_json['search_key'] = search_key
    return json.dumps(result_json)


@app.route('/search-result')
def search_result():
    return render_template('search_result.html')


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
    dataset = request.args.get('dataset')
    class_name = request.args.get('class_name')
    model_name = request.args.get('model_name')

    model_info = db_utils.get_model_info(dataset, class_name, model_name)
    print(model_info)

    return render_template('view-model.html', model=model_info)


@app.route('/team')
def team_info():
    return render_template('team.html')


if __name__ == '__main__':
    # app.run()
    app.run(host='0.0.0.0', port=8610)
