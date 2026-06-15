import os
import json
import uuid
import datetime
from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

load_dotenv()

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, (datetime.datetime, datetime.date)):
            return o.isoformat()
        if isinstance(o, ObjectId) or hasattr(o, '__str__'):
            return str(o)
        return super(JSONEncoder, self).default(o)

class MockCollection:
    def __init__(self, db_dir, name):
        self.file_path = os.path.join(db_dir, f"{name}.json")
        self.name = name
        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w') as f:
                json.dump([], f)

    def _read_data(self):
        try:
            with open(self.file_path, 'r') as f:
                return json.load(f)
        except Exception:
            return []

    def _write_data(self, data):
        with open(self.file_path, 'w') as f:
            json.dump(data, f, indent=2, cls=JSONEncoder)

    def _match(self, doc, query):
        if not query:
            return True
        for key, val in query.items():
            if key == "$or":
                match_any = False
                for sub_q in val:
                    if self._match(doc, sub_q):
                        match_any = True
                        break
                if not match_any:
                    return False
                continue
            
            # Simple attribute matching
            if key not in doc:
                return False
            
            doc_val = doc[key]
            
            # If query value is a dictionary (operators like $in, $gte, etc.)
            if isinstance(val, dict):
                for op, op_val in val.items():
                    if op == "$in":
                        if doc_val not in op_val:
                            return False
                    elif op == "$nin":
                        if doc_val in op_val:
                            return False
                    elif op == "$gte":
                        if doc_val < op_val:
                            return False
                    elif op == "$lte":
                        if doc_val > op_val:
                            return False
                    elif op == "$gt":
                        if doc_val <= op_val:
                            return False
                    elif op == "$lt":
                        if doc_val >= op_val:
                            return False
                    elif op == "$regex":
                        import re
                        flags = re.IGNORECASE if "$options" in val and "i" in val.get("$options", "") else 0
                        if not re.search(op_val, str(doc_val), flags):
                            return False
                continue

            if str(doc_val) != str(val):
                return False
        return True

    def find_one(self, query=None, projection=None):
        data = self._read_data()
        for doc in data:
            if self._match(doc, query):
                return doc.copy()
        return None

    def find(self, query=None, projection=None):
        data = self._read_data()
        results = [doc.copy() for doc in data if self._match(doc, query)]
        
        class MockCursor(list):
            def sort(self, key_or_list, direction=1):
                # Simple single key sorting support
                sort_key = key_or_list
                reverse = False
                if isinstance(key_or_list, list):
                    sort_key = key_or_list[0][0]
                    reverse = key_or_list[0][1] == -1
                elif direction == -1:
                    reverse = True
                
                try:
                    self.sort(key=lambda x: x.get(sort_key, ""), reverse=reverse)
                except Exception:
                    pass
                return self
            
            def limit(self, count):
                return MockCursor(self[:count])
                
        return MockCursor(results)

    def insert_one(self, document):
        data = self._read_data()
        doc = document.copy()
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        
        # Parse datetime objects to strings
        for k, v in doc.items():
            if isinstance(v, (datetime.datetime, datetime.date)):
                doc[k] = v.isoformat()
                
        data.append(doc)
        self._write_data(data)
        
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc["_id"])

    def update_one(self, query, update, upsert=False):
        data = self._read_data()
        updated = False
        
        # Look for existing
        for doc in data:
            if self._match(doc, query):
                if "$set" in update:
                    for k, v in update["$set"].items():
                        if isinstance(v, (datetime.datetime, datetime.date)):
                            doc[k] = v.isoformat()
                        else:
                            doc[k] = v
                if "$inc" in update:
                    for k, v in update["$inc"].items():
                        doc[k] = doc.get(k, 0) + v
                updated = True
                break
                
        if not updated and upsert:
            new_doc = query.copy()
            if "$set" in update:
                for k, v in update["$set"].items():
                    if isinstance(v, (datetime.datetime, datetime.date)):
                        new_doc[k] = v.isoformat()
                    else:
                        new_doc[k] = v
            if "_id" not in new_doc:
                new_doc["_id"] = str(uuid.uuid4())
            data.append(new_doc)
            self._write_data(data)
            updated = True
            
        if updated:
            self._write_data(data)
            
        class UpdateResult:
            def __init__(self, matched, modified):
                self.matched_count = matched
                self.modified_count = modified
        return UpdateResult(1 if updated else 0, 1 if updated else 0)

    def update_many(self, query, update):
        data = self._read_data()
        count = 0
        for doc in data:
            if self._match(doc, query):
                if "$set" in update:
                    for k, v in update["$set"].items():
                        if isinstance(v, (datetime.datetime, datetime.date)):
                            doc[k] = v.isoformat()
                        else:
                            doc[k] = v
                if "$inc" in update:
                    for k, v in update["$inc"].items():
                        doc[k] = doc.get(k, 0) + v
                count += 1
        if count > 0:
            self._write_data(data)
            
        class UpdateResult:
            def __init__(self, count):
                self.matched_count = count
                self.modified_count = count
        return UpdateResult(count)

    def delete_one(self, query):
        data = self._read_data()
        idx_to_remove = -1
        for idx, doc in enumerate(data):
            if self._match(doc, query):
                idx_to_remove = idx
                break
        if idx_to_remove != -1:
            data.pop(idx_to_remove)
            self._write_data(data)
            
        class DeleteResult:
            def __init__(self, count):
                self.deleted_count = count
        return DeleteResult(1 if idx_to_remove != -1 else 0)

    def delete_many(self, query):
        data = self._read_data()
        original_len = len(data)
        data = [doc for doc in data if not self._match(doc, query)]
        deleted = original_len - len(data)
        if deleted > 0:
            self._write_data(data)
            
        class DeleteResult:
            def __init__(self, count):
                self.deleted_count = count
        return DeleteResult(deleted)

    def count_documents(self, query=None):
        data = self._read_data()
        if not query:
            return len(data)
        return sum(1 for doc in data if self._match(doc, query))

class MockDatabase:
    def __init__(self, db_dir):
        self.db_dir = db_dir
        os.makedirs(db_dir, exist_ok=True)
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(self.db_dir, name)
        return self.collections[name]

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_mock = False
        
        # Load env parameters
        mongo_uri = os.getenv("MONGO_URI")
        use_mock = os.getenv("USE_MOCK_DB", "false").lower() == "true"
        
        if use_mock:
            self._init_mock()
            return

        try:
            # Short timeout so local startup doesn't freeze for 30s
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)
            # Trigger server selection to verify connection
            self.client.admin.command('ping')
            # Extract database name from URI or use default
            db_name = mongo_uri.split('/')[-1].split('?')[0] if '/' in mongo_uri else 'jim_hostel'
            if not db_name or db_name == 'cluster0.example.mongodb.net':
                db_name = 'jim_hostel'
            self.db = self.client[db_name]
            print(f"Successfully connected to MongoDB cluster: {db_name}")
            self._create_indexes()
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            print(f"MongoDB connection failed: {e}. Falling back to local file-based database.")
            self._init_mock()

    def _create_indexes(self):
        try:
            # Create indexes on students collection
            self.db["students"].create_index("register_number")
            self.db["students"].create_index("room_number")
            self.db["students"].create_index("status")
            
            # Create indexes on attendance collection
            self.db["attendance"].create_index([("date", 1), ("type", 1)])
            self.db["attendance"].create_index("student_id")
            self.db["attendance"].create_index("room_number")
            
            # Create indexes on users collection
            self.db["users"].create_index("username", unique=True)
            
            # Create indexes on rooms collection
            self.db["rooms"].create_index("room_number", unique=True)
            
            # Create indexes on notifications collection
            self.db["notifications"].create_index("status")
            
            print("Database indexes ensured successfully.")
        except Exception as e:
            print(f"Failed to create indexes: {e}")

    def _init_mock(self):
        self.is_mock = True
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(backend_dir, "data")
        self.db = MockDatabase(data_dir)
        print(f"Local file-based mock database initialized at {data_dir}")

    def get_db(self):
        return self.db

# Global Database Instance
db_instance = Database()

def get_db():
    return db_instance.get_db()
