import datetime
import random
import bcrypt
from database import get_db

# Cohort 1: II MBA Students (Boys Hostel - Toulouse Arena)
students_ii_mba_raw = [
    ("DARWIN INFANT RAAJ P", "A1", "9025778062"),
    ("JASON HANSEL SAMUEL J", "A1", "9629080707"),
    ("SANJEEV KUMAR", "A1", "9788145265"),
    ("JAVANSKER J", "A1", "7358912053"),
    ("VISHWANATHAN I", "A1", "7397101696"),
    ("ABISHAK RAJ S", "A1", "8778672197"),
    ("PRAVEENRAJ R", "A2", "9944204775"),
    ("EDISAN", "A2", "9791852919"),
    ("DICKSON D", "A2", "9344337927"),
    ("DANIEL A", "A2", "9342734528"),
    ("NITHISH M", "A2", "8608350046"),
    ("JANICK ANTO", "A2", "9791601172"),
    ("KISHORE KUMAR V", "A3", "8220207197"),
    ("MILAN SHIJOE J", "A3", "9087570647"),
    ("AKILAN SEBASTIN V", "A3", "6382442388"),
    ("RENO SINGAR X", "A3", "9585957204"),
    ("ANTO JEFFIN J", "A3", "7339153605"),
    ("KEVIN JOSHVA S", "A3", "9843851625"),
    ("VENKATESHWAR", "A4", "9944882503"),
    ("YUVARAJAN R A", "A4", "6385377743"),
    ("RUBAN A", "A4", "8072701241"),
    ("SUNIL SANGEETH J", "A4", "9025801784"),
    ("ROBIN J", "A4", "7708051236"),
    ("GODWINGINUS A", "A4", "8667044995"),
    ("ASWIN R", "A5", "9042210699"),
    ("ARMEL", "A5", "7397527914"),
    ("TENNIS DASS M", "A5", "7094624774"),
    ("GABRIEL THANGAM SEBASTIAN", "A5", "9840344348"),
    ("INFANT TOM F", "A5", "9344250771"),
    ("ABITHEJ P", "A5", "7418393614"),
    ("VELANGANNI SELVARAJ S", "A6", "7010850801"),
    ("ANTONY GNANA AAKASH A", "A6", "7418781972"),
    ("JEGAN A", "A6", "8610063279"),
    ("JACK J FERNANDEZ", "A6", "9345764068"),
    ("RUBANRAJ G", "A6", "9952820710"),
    ("ROSHAN J", "A6", "7598042356"),
    ("REJI JEGAN V", "B1", "8248496882"),
    ("JINOSOBAN M", "B1", "9486744865"),
    ("GAJA BALAJI", "B1", "9842499533"),
    ("SUJET RAJA S", "B1", "8778294332"),
    ("PRAVIN PON", "B1", "8925451036"),
    ("SUDHARSAN REDDY R", "B1", "7598633818"),
    ("HARI SANKARAN R", "B5", "7904254696"),
    ("VALAN J", "B5", "9677860013"),
    ("JANARIUS", "B5", "7099809937")
]

# Cohort 2: I MBA Students (Boys Hostel - Toulouse Arena)
students_i_mba_raw = [
    ("NIVONE PRABAKARAN", "B2", "JIM2620002", "9342429316"),
    ("PRAVEEN KUMAR S", "B2", "JIM2620007", "8754159757"),
    ("DEEPAK XAVIER S", "B2", "JIM2620013", "9087102725"),
    ("SUJITH J", "B2", "JIM2620016", "9344105671"),
    ("ESTAN J", "B2", "JIM2620020", "9524340209"),
    ("GOKUL V", "B2", "JIM2620024", "8870841494"),
    ("HARISH RAGAVENDRA", "B3", "JIM2620030", "8148098831"),
    ("ROSHAN J", "B3", "JIM2620034", "7708982072"),
    ("SARON TONI SELVAN", "B3", "JIM2620043", "9344177810"),
    ("M NAVEEN PRASAD", "B3", "JIM2620050", "9600345535"),
    ("PREMKALYAAN V", "B3", "JIM2620057", "9384138338"),
    ("ALEX A", "B3", "JIM2620114", "9150874031"),
    ("R KAUSHIK", "B4", "JIM2620157", "7598663277"),
    ("GOPI S", "B4", "JIM2620129", "7538882926"),
    ("S ASWIN", "B4", "JIM2620221", "8610245505"),
    ("ALEXIN PIO S", "B4", "JIM2620265", "7200189645"),
    ("THOMAS DANIEL S", "B4", "JIM2620207", "7708116381"),
    ("ANTO BRIGHTEN J", "B4", "JIM2620276", "7373630552"),
    ("Engine Britto", "B4", "JIM2620280", "9876543201"),
    ("Varun", "B4", "JIM2620285", "9876543202"),
    ("JONES HARISH P", "B5", "JIM2620085", "7824038046"),
    ("V R JUDE MICHAEL", "B5", "JIM2620143", "9790245562"),
    ("LEOMARAN P", "B5", "JIM2620253", "9876543203"),
    ("HARIPRAKASH B", "B5", "JIM2620296", "9876543204"),
    ("LEONI RAJA SINGH D", "B6", "JIM2620118", "8973562393"),
    ("ANTO ABINESH V", "B6", "JIM2620136", "9942321421"),
    ("JOE CANICE VALAN E", "B6", "JIM2620140", "9626497731"),
    ("DANIAL J", "B6", "JIM2620141", "8300831283"),
    ("JAI BALAJEE G", "B8", "JIM2620146", "7010182048"),
    ("JIFFIN JUDE A", "B8", "JIM2620224", "9600073255"),
    ("ALVIS JOY A", "B8", "JIM2620226", "9092381365"),
    ("MOVIN RAJ I", "B8", "JIM2620084", "9043275398"),
    ("SUBASHCHANDRABO", "B8", "JIM2620247", "8778193352"),
]

def hash_pw(pw):
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_database():
    db = get_db()
    print("Deleting old collections...")
    db["users"].delete_many({})
    db["students"].delete_many({})
    db["rooms"].delete_many({})
    db["attendance"].delete_many({})
    db["leave_requests"].delete_many({})
    db["visitors"].delete_many({})
    db["late_entries"].delete_many({})
    db["notifications"].delete_many({})

    print("Seeding Users...")
    users = [
        {
            "_id": "user_admin",
            "username": "admin",
            "password_hash": hash_pw("admin123"),
            "email": "admin@jim.edu",
            "role": "Admin",
            "name": "JIM System Admin",
            "created_at": datetime.datetime.utcnow().isoformat()
        },
        {
            "_id": "user_ad",
            "username": "ad_boys",
            "password_hash": hash_pw("ad123"),
            "email": "ad_boys@jim.edu",
            "role": "AD",
            "name": "Mr. Darwin (AD Boys)",
            "created_at": datetime.datetime.utcnow().isoformat()
        },
        {
            "_id": "user_director",
            "username": "director",
            "password_hash": hash_pw("director123"),
            "email": "director@jim.edu",
            "role": "Director",
            "name": "Dr. Joseph (Director)",
            "created_at": datetime.datetime.utcnow().isoformat()
        }
    ]
    for u in users:
        db["users"].insert_one(u)

    print("Seeding Rooms...")
    room_list = [
        "A1", "A2", "A3", "A4", "A5", "A6",
        "B1", "B2", "B3", "B4", "B5", "B6", "B8"
    ]
    
    # Precalculate capacities and occupancy across both lists
    room_occupants = {}
    for r in room_list:
        room_occupants[r] = 0
    for name, r, mobile in students_ii_mba_raw:
        if r in room_occupants:
            room_occupants[r] += 1
    for name, r, reg, mobile in students_i_mba_raw:
        if r in room_occupants:
            room_occupants[r] += 1

    for r in room_list:
        # Give rooms B4 and B5 slightly higher capacity since they naturally house more students
        capacity = 8 if r in ["B4", "B5"] else 6
        occupied = room_occupants.get(r, 0)
        room_doc = {
            "_id": r,
            "block": "Toulouse Arena",
            "floor": 1 if r.startswith("A") else 2,
            "capacity": capacity,
            "occupied": occupied,
            "available_beds": capacity - occupied
        }
        db["rooms"].insert_one(room_doc)

    print("Seeding Students (II MBA & I MBA)...")
    seeded_students = []
    
    # II MBA Students
    for idx, (name, r, mobile) in enumerate(students_ii_mba_raw):
        stud_id = f"JIM2026{idx+1:03d}"
        reg_num = f"REG2026{idx+1:03d}"
        email = name.lower().replace(" ", ".") + "@jim.edu"
        parent_num = str(int(mobile) + 111) if len(mobile) == 10 else "9876543210"
        
        student_doc = {
            "_id": stud_id,
            "register_number": reg_num,
            "name": name,
            "course": "II MBA",
            "year": "II",
            "department": "Business Administration",
            "room_number": r,
            "mobile": mobile,
            "parent_mobile": parent_num,
            "email": email,
            "photo": "",
            "hostel_name": "JIM Boys Hostel",
            "block": "Toulouse Arena",
            "status": "Active",
            "attendance_percentage": 100.0,
            "last_attendance": ""
        }
        db["students"].insert_one(student_doc)
        seeded_students.append(student_doc)

    # I MBA Students
    for name, r, reg_num, mobile in students_i_mba_raw:
        stud_id = reg_num  # use their app number/id as _id
        email = name.lower().replace(" ", ".") + "@jim.edu"
        parent_num = str(int(mobile) + 111) if len(mobile) == 10 else "9876543210"
        
        student_doc = {
            "_id": stud_id,
            "register_number": reg_num,
            "name": name,
            "course": "I MBA",
            "year": "I",
            "department": "Business Administration",
            "room_number": r,
            "mobile": mobile,
            "parent_mobile": parent_num,
            "email": email,
            "photo": "",
            "hostel_name": "JIM Boys Hostel",
            "block": "Toulouse Arena",
            "status": "Active",
            "attendance_percentage": 100.0,
            "last_attendance": ""
        }
        db["students"].insert_one(student_doc)
        seeded_students.append(student_doc)

    print("Seeding 7 Days of Attendance History...")
    today = datetime.date.today()
    attendance_types = ["morning", "night"]
    
    # Create mock absent details
    # - PRAVEENRAJ R: Absent for last 5 days
    # - SUJET RAJA S: Absent for last 3 days
    # - GOKUL V: Absent for last 3 days
    
    for i in range(7):
        current_date = today - datetime.timedelta(days=i)
        date_str = current_date.strftime("%Y-%m-%d")
        
        for att_type in attendance_types:
            for s in seeded_students:
                s_id = s["_id"]
                s_name = s["name"]
                
                status = "Present"
                remarks = ""
                
                if s_name == "PRAVEENRAJ R" and i < 5:
                    status = "Absent"
                    remarks = "Uninformed Absence"
                elif s_name == "SUJET RAJA S" and i < 3:
                    status = "Absent"
                    remarks = "Sick leave"
                elif s_name == "GOKUL V" and i < 3:
                    status = "Absent"
                    remarks = "curfew violation"
                else:
                    # Random small chance of being absent or late for other students
                    r_val = random.random()
                    if r_val < 0.02:
                        status = "Absent"
                        remarks = "Unwell"
                    elif r_val < 0.04:
                        status = "Late Entry"
                        remarks = "Library study"
                
                att_doc = {
                    "_id": f"{date_str}_{att_type}_{s_id}",
                    "date": date_str,
                    "type": att_type,
                    "room_number": s["room_number"],
                    "student_id": s_id,
                    "status": status,
                    "remarks": remarks,
                    "marked_by": "Mr. Darwin (AD Boys)",
                    "timestamp": f"{date_str}T{'08' if att_type == 'morning' else '21'}:30:00"
                }
                db["attendance"].insert_one(att_doc)

    # Seed visitor entry
    darwin_student = next(s for s in seeded_students if s["name"] == "DARWIN INFANT RAAJ P")
    visitor_doc = {
        "_id": "visitor_1",
        "visitor_name": "Antony Raj (Father)",
        "student_id": darwin_student["_id"],
        "relationship": "Father",
        "phone_number": "9443552145",
        "entry_time": f"{today.strftime('%Y-%m-%d')}T10:15:00",
        "exit_time": f"{today.strftime('%Y-%m-%d')}T11:30:00",
        "purpose": "Delivering home food",
        "created_at": f"{today.strftime('%Y-%m-%d')}T10:15:00"
    }
    db["visitors"].insert_one(visitor_doc)

    # Seed late entry
    gokul = next(s for s in seeded_students if s["name"] == "GOKUL V")
    late_doc = {
        "_id": "late_1",
        "student_id": gokul["_id"],
        "entry_time": f"{today.strftime('%Y-%m-%d')}T22:50:00",
        "reason": "Late back from project work in labs",
        "approved_by": "Mr. Darwin (AD Boys)",
        "created_at": f"{today.strftime('%Y-%m-%d')}T22:50:00"
    }
    db["late_entries"].insert_one(late_doc)

    # Update student attendance percentages in DB
    print("Recalculating student attendance percentages...")
    for s in seeded_students:
        s_id = s["_id"]
        total_att = db["attendance"].count_documents({"student_id": s_id})
        leaves = db["attendance"].count_documents({"student_id": s_id, "status": "Leave"})
        presents = db["attendance"].count_documents({"student_id": s_id, "status": {"$in": ["Present", "Late Entry"]}})
        
        denom = total_att - leaves
        if denom > 0:
            percentage = round((presents / denom) * 100, 1)
        else:
            percentage = 100.0
            
        last_att_doc = list(db["attendance"].find({"student_id": s_id}).sort("timestamp", -1).limit(1))
        last_att_status = last_att_doc[0]["status"] if last_att_doc else "None"
        
        db["students"].update_one(
            {"_id": s_id},
            {"$set": {
                "attendance_percentage": percentage,
                "last_attendance": last_att_status
            }}
        )

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
