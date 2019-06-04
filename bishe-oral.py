from flask import Flask, render_template, request, url_for, send_from_directory, send_file
from utils.process_file import get_model_name, get_class_name_by_name
from utils.dataset import get_model_info, get_model_url
import methods.smy.info as smy
import methods.wxy.info as wxy
import json
import os

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# db_utils.root_dir = app.root_path
# app.root_path = os.getcwd()
root_path = os.getcwd()
@app.route('/download')
def download_file():
    model_name = request.args.get('modelname')
    # print(root_path, get_model_url(model_name))
    model_path = os.path.join(root_path, "static", "database", "modelnet10", "test", model_name+".off" )
    print(model_path)
    return send_file(model_path, as_attachment=True)


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)


@app.route('/search', methods=['POST'])
def search():

    search_author = request.form.get('author')
    search_type = request.form.get('type')
    search_method = request.form.get('method')
    filename = request.form.get('name')
    # search_author = 'wxy'
    # filename = 'bathtub_0107.off'
    print('search----> ', search_type, search_author, search_method)
    result_json = {}

    if search_type == 'file':
        model_name = get_model_name(filename)
        print('search file', model_name)
        if search_author == 'smy':
            result_json = smy.get_total_info(model_name, search_method)
            print(json.dumps(result_json['center_view_recon']))
        else:
            result_json = wxy.get_total_info(model_name, search_method)
            print(json.dumps(result_json['view_recon']))
    ret_str = json.dumps(result_json)
    # print(json.dumps(result_json['attns']))
    return ret_str


@app.route('/retrieval.html')
def retrieval():
    return render_template('retrieval.html')


@app.route('/retrieval_wxy.html')
def retrieval_wxy():
    return render_template('retrieval_wxy.html')


@app.route('/viewer')
def model_view():
    search_method = request.args.get('method')
    search_author = request.args.get('author')
    if search_author is None:
        search_author = 'wxy'
    if search_method is None:
        search_method = '3DViewGraph'
    model_name = request.args.get('model_name')
    if search_author == 'smy':
        model_info = smy.get_model_info_by_name(model_name, search_method)
    else:
        model_info = wxy.get_model_info_by_name(model_name, search_method)

    return render_template('view-model.html', model=model_info)


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/wxy')
def root_wxy():
    return render_template('index_wxy.html')


@app.route('/index.html')
def index():
    return render_template('index.html')


@app.route('/index_wxy.html')
def index_wxy():
    return render_template('index_wxy.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8610)