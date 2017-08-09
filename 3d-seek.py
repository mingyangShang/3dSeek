from flask import Flask, render_template, request, url_for, send_from_directory
from utils.process_file import random_str, get_file_type, get_file_extensions
from utils.search_engineer import search_by_feature, search_by_text
import os
from flask import json

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)


@app.route('/api/set-names', methods=['GET'])
def get_set_infos():
    sets = ["ModelNet", "ShapeNet"]
    info_dic = {"sets": sets}
    sub_dic = {"ModelNet": ["ModelNet10", "ModelNet40"], "ShapeNet": ["ShapeNet-Core", "ShapeNet-Sem"]}
    info_dic['subsets'] = sub_dic
    return json.dumps(info_dic)


@app.route('/api/set-classes', methods=['GET'])
def get_set_classes():
    modelnet10_dic = {}
    modelnet10_dic['text'] = 'all'
    modelnet10_dic['href'] = '#' + modelnet10_dic['text']
    modelnet10_dic['tags'] = '10'
    nodes = []
    for i in range(4):
        node = {}
        node['text'] = 'modelnet-' + str(i + 1)
        node['href'] = '#' + node['text']
        node['tags'] = str(i + 1)
        nodes.append(node)
    modelnet10_dic['nodes'] = nodes

    modelnet40_dic = {}
    modelnet40_dic['text'] = 'all'
    modelnet40_dic['href'] = '#' + modelnet40_dic['text']
    modelnet40_dic['tags'] = '15'
    nodes = []
    for i in range(5):
        node = {}
        node['text'] = 'modelnet-' + str(i + 1)
        node['href'] = '#' + node['text']
        node['tags'] = str(i + 1)
        nodes.append(node)
    modelnet40_dic['nodes'] = nodes

    total = {"ModelNet10": modelnet10_dic, "ModelNet40": modelnet40_dic}
    return json.dumps(total)


@app.route('/search', methods=['POST'])
def search():
    upload_file = request.files['upload_file']
    search_method = request.form['method_name']
    search_text = request.form['search_text']
    data_set = request.form['data_set']
    print(upload_file.filename, search_method, search_text)
    file_type = get_file_type(upload_file.filename)
    if file_type == 'TEXT':
        search_by_text(search_text, data_set)
    else:
        filename = random_str() + '.' + get_file_extensions(upload_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        upload_file.save(file_path)

    print(search_method)
    filename = random_str() + '.' + get_file_extensions(upload_file.filename)
    upload_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    file_url = url_for('uploaded_file', filename=filename)
    print(file_url)
    return render_template('index.html')


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.route('/experiment-result')
def experiment_result():
    return render_template('experiment_result.html')


@app.route('/middle-result')
def middle_result():
    return render_template('middle_result.html')


@app.route('/team')
def team_info():
    return render_template('team.html')


if __name__ == '__main__':
    # app.run()
    app.run(host='0.0.0.0', port=8610)
