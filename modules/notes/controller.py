from modules import mysql
from modules.controller import calculate_time_passed
def createNote(note: tuple):
    try:
        cur = mysql.connection.cursor()
        create_query = "INSERT INTO `notes` (`title`, `privacy`, `owner_id`, `link`) VALUES (%s, %s, %s, %s);"
        cur.execute(create_query, note)
        mysql.connection.commit()
    except mysql.connection.IntegrityError as e:
        mysql.connection.rollback()
        if e.args[0] == 1062:
            raise ValueError("A note with this title already exists for this user.")
        else:
            raise e
    except mysql.connection.Error as e:
        mysql.connection.rollback()
        raise e
    finally:
        cur.close()

def deleteNote(id :str):
    try:
        cur = mysql.connection.cursor()
        delete_query = "DELETE FROM `notes` WHERE `id`=%s;"
        cur.execute(delete_query, (id,))
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()
        raise e
    finally:
        cur.close()

def updateNote(note :tuple):
    try:
        cur = mysql.connection.cursor()
        update_query = """
            UPDATE `notes`
            SET `title` = %s, `privacy` = %s, `link` = %s
            WHERE `id` = %s;
        """
        cur.execute(update_query, note)
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()
        raise e
    finally:
        cur.close()


def fetchPreviewNotes(owner_id :str):
    try:
        cur = mysql.connection.cursor()
        fetch_id = """
            SELECT notes.id, notes.title, notes.link, notes.privacy, students.name, notes.created_on
            FROM notes
            JOIN students ON notes.owner_id = students.id
            WHERE notes.owner_id = %s
            ORDER BY notes.created_on DESC
            LIMIT 5;
        """

        cur.execute(fetch_id, (owner_id,))
        raw_results = cur.fetchall()
        
        # Process `created_on` to calculate "time passed"
        processed_results = []
        for row in raw_results:
            id, title, link, privacy, owner_name, created_on = row
            time_passed = calculate_time_passed(created_on)
            processed_results.append((id, title, link, privacy, owner_name, time_passed))


        return processed_results
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed