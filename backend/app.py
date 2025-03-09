from flask import Flask, render_template, send_from_directory
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from models import db
from routes import api
from config import Config
import os

app = Flask(__name__,
    static_folder='static',
    template_folder='templates'
)

app.config.from_object(Config)
db.init_app(app)
jwt = JWTManager(app)
CORS(app)

# Реєструємо API маршрути
app.register_blueprint(api, url_prefix='/api')

# Маршрут для головної сторінки
@app.route('/')
def index():
    return render_template('index.html')

# Створюємо необхідні папки, якщо вони не існують
def create_folders():
    folders = ['templates', 'static', 'static/css', 'static/js']
    for folder in folders:
        os.makedirs(os.path.join(os.path.dirname(__file__), folder), exist_ok=True)

if __name__ == '__main__':
    create_folders()
    with app.app_context():
        db.create_all()
    app.run(debug=True) 