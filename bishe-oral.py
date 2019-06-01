from flask import Flask, render_template, request, url_for, send_from_directory, send_file
from utils.process_file import get_model_name
import methods.smy.info as smy
import methods.wxy.info as wxy
import json
import os

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# db_utils.root_dir = app.root_path

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)


@app.route('/search', methods=['POST'])
def search():

    search_author = request.form.get('author')
    search_type = request.form.get('type')
    search_method = request.form.get('method')
    filename = 'bathtub_0107.off'
    print('search----> ', search_type, search_author, search_method)
    result_json = {}

    if search_type == 'file':
        model_name = get_model_name(filename)
        print('search file', model_name)
        if search_author == 'smy':
            result_json = smy.get_total_info(model_name)
        else:
            result_json = wxy.get_total_info(model_name)
    return json.dumps(result_json)


@app.route('/retrieval.html')
def retrieval():
    return render_template('retrieval.html')


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/index.html')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8610)