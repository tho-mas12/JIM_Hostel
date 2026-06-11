import os
import json
from pymongo import MongoClient

# Cloud MongoDB Connection URI
CLOUD_URI = "mongodb+srv://darwinthomas205_db_user:thomasDarwin12@cluster0.vmpo19j.mongodb.net/jim_hostel?retryWrites=true&w=majority"
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

collections_list = [
    "users",
    "students",
    "rooms",
    "attendance",
    "leave_requests",
    "late_entries",
    "notifications",
    "audit_logs",
    "visitors"
]

def migrate():
    print("Connecting to MongoDB Atlas cloud database...")
    try:
        client = MongoClient(CLOUD_URI, serverSelectionTimeoutMS=5000)
        # Ping the server
        client.admin.command('ping')
        db = client["jim_hostel"]
        print("Connected successfully to cloud cluster!")
    except Exception as e:
        print(f"Error connecting to cloud database: {e}")
        return

    # Loop through each collection
    for col_name in collections_list:
        file_path = os.path.join(DATA_DIR, f"{col_name}.json")
        if not os.path.exists(file_path):
            print(f"Skipping {col_name}: local file not found.")
            continue

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as err:
            print(f"Error reading local file {file_path}: {err}")
            continue

        if not isinstance(data, list):
            print(f"Skipping {col_name}: data is not a JSON array list.")
            continue

        print(f"Migrating collection '{col_name}' ({len(data)} documents)...")
        collection = db[col_name]
        
        # Drop/clear existing data in cloud for this collection to perform fresh sync
        try:
            collection.delete_many({})
            if len(data) > 0:
                result = collection.insert_many(data)
                print(f"  Inserted {len(result.inserted_ids)} records into cloud collection '{col_name}'.")
            else:
                print(f"  Collection '{col_name}' was empty. Cleared cloud data successfully.")
        except Exception as exc:
            print(f"  Error migrating {col_name} documents: {exc}")

    print("\nMigration sync to cloud MongoDB Atlas completed successfully!")

if __name__ == "__main__":
    migrate()
