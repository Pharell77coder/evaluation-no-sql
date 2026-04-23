from flask import Flask, render_template, request, redirect, url_for, jsonify
from pymongo import MongoClient
from bson import ObjectId
from flask_cors import CORS 

app = Flask(__name__)
CORS(app) 

client = MongoClient("mongodb://localhost:27017/")
db = client["user_management_db"]
users_col = db["users"]

def format_user(user):
    if user:
        user["_id"] = str(user["_id"])
    return user

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/users', methods=['GET'])
def get_users():
    users = list(users_col.find())
    return jsonify([format_user(u) for u in users])

@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    new_user = {
        "name": data.get("name"),
        "email": data.get("email"),
        "addresses": data.get("addresses", []),
        "preferences": data.get("preferences", {"theme": "light", "notifications": False})
    }
    result = users_col.insert_one(new_user)
    return jsonify({"id": str(result.inserted_id), "message": "Utilisateur créé"}), 201

@app.route('/users/<id>', methods=['PUT'])
def update_user(id):
    data = request.json
    users_col.update_one({"_id": ObjectId(id)}, {"$set": data})
    return jsonify({"message": "Utilisateur modifié"}), 200

@app.route('/users/<id>', methods=['DELETE'])
def delete_user(id):
    users_col.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Utilisateur supprimé"}), 200

@app.route('/users/advanced', methods=['GET'])
def advanced_filter():
    query = {
        "preferences.notifications": True,
        "$expr": { "$gt": [{ "$size": "$addresses" }, 1] }
    }
    users = list(users_col.find(query))
    return jsonify([format_user(u) for u in users])

@app.route('/users/search/<name>', methods=['GET'])
def search_user(name):
    query = {"name": {"$regex": name, "$options": "i"}}
    users = list(users_col.find(query))
    return jsonify([format_user(u) for u in users])

if __name__ == '__main__':
    app.run(debug=True, port=5000)