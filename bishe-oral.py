from flask import Flask, render_template, request, url_for, send_from_directory, send_file
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
    print('----> search')
    # search_type = request.form.get('type')
    # search_method = request.form.get('method')
    # result_json = {}
    # print(search_type)
    # if search_type == 'file':
    #     print('search file')
    #     upload_file = request.files['file']
    #     filename = upload_file.filename
    #     file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    #     upload_file.save(file_path)


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