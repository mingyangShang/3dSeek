from flask import Flask, render_template, request, url_for, send_from_directory, send_file
from utils.process_file import random_str, get_file_type, get_file_extensions
from utils.search_engineer import search_by_feature, search_by_text
import os
from flask import json
import utils.database_utils as db_utils

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

db_utils.root_dir = app.root_path


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
    :return: 
    """
    dataset = request.args.get('dataset')
    class_name = request.args.get('class_name')
    page = request.args.get('page')
    if page is None:
        page = 1
    else:
        page = int(page)
    size = 30
    return db_utils.get_class_detail(dataset, class_name, page, size)

@app.route('/search-result')
def search_result():
    return render_template("search_result.html")

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
