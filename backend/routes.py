from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Account, Category, Transaction, Budget
from datetime import datetime

api = Blueprint('api', __name__)

# Аутентифікація
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return {"message": "Користувач вже існує"}, 400
        
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        username=data['username'],
        password=hashed_password,
        email=data['email']
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return {"message": "Користувач успішно зареєстрований"}, 201

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return {"access_token": access_token}, 200
        
    return {"message": "Невірний логін або пароль"}, 401

# Рахунки
@api.route('/accounts', methods=['GET', 'POST'])
@jwt_required()
def manage_accounts():
    user_id = get_jwt_identity()
    
    if request.method == 'POST':
        data = request.get_json()
        new_account = Account(
            user_id=user_id,
            name=data['name'],
            balance=data.get('balance', 0.0),
            currency=data.get('currency', 'UAH')
        )
        db.session.add(new_account)
        db.session.commit()
        return {"message": "Рахунок створено", "id": new_account.id}, 201
        
    accounts = Account.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": acc.id,
        "name": acc.name,
        "balance": acc.balance,
        "currency": acc.currency
    } for acc in accounts])

# Категорії
@api.route('/categories', methods=['GET', 'POST'])
@jwt_required()
def manage_categories():
    user_id = get_jwt_identity()
    
    if request.method == 'POST':
        data = request.get_json()
        new_category = Category(
            user_id=user_id,
            name=data['name'],
            type=data['type']
        )
        db.session.add(new_category)
        db.session.commit()
        return {"message": "Категорію створено", "id": new_category.id}, 201
        
    categories = Category.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": cat.id,
        "name": cat.name,
        "type": cat.type
    } for cat in categories])

# Транзакції
@api.route('/transactions', methods=['GET', 'POST'])
@jwt_required()
def manage_transactions():
    user_id = get_jwt_identity()
    
    if request.method == 'POST':
        data = request.get_json()
        new_transaction = Transaction(
            user_id=user_id,
            account_id=data['account_id'],
            category_id=data['category_id'],
            amount=data['amount'],
            type=data['type'],
            description=data.get('description', ''),
            date=datetime.fromisoformat(data.get('date', datetime.utcnow().isoformat()))
        )
        
        account = Account.query.get(data['account_id'])
        if data['type'] == 'income':
            account.balance += data['amount']
        else:
            account.balance -= data['amount']
            
        db.session.add(new_transaction)
        db.session.commit()
        return {"message": "Транзакцію створено", "id": new_transaction.id}, 201
        
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": trans.id,
        "account": trans.account.name,
        "category": trans.category.name,
        "amount": trans.amount,
        "type": trans.type,
        "description": trans.description,
        "date": trans.date.isoformat()
    } for trans in transactions])

# Бюджети
@api.route('/budgets', methods=['GET', 'POST'])
@jwt_required()
def manage_budgets():
    user_id = get_jwt_identity()
    
    if request.method == 'POST':
        data = request.get_json()
        new_budget = Budget(
            user_id=user_id,
            category_id=data['category_id'],
            amount=data['amount'],
            period=data['period'],
            start_date=datetime.fromisoformat(data['start_date']),
            end_date=datetime.fromisoformat(data['end_date'])
        )
        db.session.add(new_budget)
        db.session.commit()
        return {"message": "Бюджет створено", "id": new_budget.id}, 201
        
    budgets = Budget.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": budget.id,
        "category": budget.category.name,
        "amount": budget.amount,
        "period": budget.period,
        "start_date": budget.start_date.isoformat(),
        "end_date": budget.end_date.isoformat()
    } for budget in budgets]) 