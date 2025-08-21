import mysql.connector
from db_config import db_config

# Define the terms to insert
terms_to_seed = [
    "Fall 2023",
    "Winter 2024",
    "Summer 2024",
    "Fall 2024",
    "Winter 2025",
    "Summer 2025",
    "Fall 2025",
    "Winter 2026",
    "Summer 2026",
    "Fall 2026",
    "Winter 2027",
    "Summer 2027",
    "Fall 2027"
]

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # Check existing terms to avoid duplicates
    cursor.execute("SELECT term_name FROM Terms")
    existing_terms = {row[0] for row in cursor.fetchall()}

    inserted_count = 0

    for term in terms_to_seed:
        if term not in existing_terms:
            cursor.execute("INSERT INTO Terms (term_name) VALUES (%s)", (term,))
            inserted_count += 1

    conn.commit()
    print(f" {inserted_count} new term(s) inserted.")
    if inserted_count == 0:
        print(" All terms already exist. No changes made.")

except mysql.connector.Error as err:
    print(" Error while seeding terms:", err)

finally:
    if conn.is_connected():
        cursor.close()
        conn.close()
