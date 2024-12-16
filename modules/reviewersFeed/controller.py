from modules import mysql
from modules.controller import fetchStudent, calculate_time_passed
'''
Controllers for the Reviewers List
'''

# Count how many reviewers there are based on the parameters
def countReviewers(type: str, param: str, order: str):
    try:
        cur = mysql.connection.cursor()
        
        fetch_query = None
        fetch_param = []

        if type == "Notes":
            fetch_query = """
                SELECT COUNT(`id`) FROM `notes`
                WHERE `privacy` = "Public"
            """
        else:
            fetch_query = """
                SELECT COUNT(`id`) FROM `reviewers`
                WHERE `privacy` = "Public"
            """
            if type != "All Reviewers":
                fetch_query += " AND `type` = %s"
                fetch_param.append(type)
        
        # Apply filters if any
        if param:
            fetch_query += " AND `title` COLLATE utf8mb4_bin LIKE %s"
            fetch_param.append(f"%{param}%")

        fetch_query += f" ORDER BY `created_on` {order};"
        cur.execute(fetch_query, tuple(fetch_param))

        return cur.fetchone()[0]
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

# Fetch the reviewers based on the parameters n pieces at a time for pagination
def fetchReviewers(type: str, param: str, order: str, page: int, items_per_page: int, user_id :str):
    try:
        cur = mysql.connection.cursor()
        
        fetch_query = None
        fetch_param = []

        if type == "Notes":
            fetch_query = """
                SELECT `id`, `title`, `link`, `created_on`, `owner_id`, `view_count` FROM `notes`
                WHERE `privacy` = "Public"
            """
        else:
            fetch_query = """
                SELECT `id`, `title`, `type`, `created_on`, `owner_id`, `view_count` FROM `reviewers`
                WHERE `privacy` = "Public"
            """
            if type != "All Reviewers":
                fetch_query += " AND `type` = %s"
                fetch_param.append(type)
        
        # Apply filters if any
        if param:
            fetch_query += " AND `title` COLLATE utf8mb4_bin LIKE %s"
            fetch_param.append(f"%{param}%")

        # Order and limit for pagination
        fetch_query += f" ORDER BY `created_on` {order} LIMIT %s OFFSET %s"
        offset = (page - 1) * items_per_page
        fetch_param.extend([items_per_page, offset])

        cur.execute(fetch_query, tuple(fetch_param))
        raw_results = cur.fetchall()

        # Process `created_on` to calculate "time passed"
        processed_results = []
        for row in raw_results:
            id, title, info, created_on, owner_id, view_count = row
            time_passed = calculate_time_passed(created_on)
            owner_name = fetchStudent(owner_id)[0][1]
            processed_results.append((id, title, info, time_passed, owner_name, isReviewerSaved(id, user_id) if not type == "Notes" else isNoteSaved(id, user_id), view_count))

        return processed_results

    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def addViewCount(id :str):
    try:
        cur = mysql.connection.cursor()
        counter_update = """
            UPDATE `reviewers`
            SET `view_count` = `view_count` + 1
            WHERE `id` = %s;
        """
        cur.execute(counter_update, (id,))
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def isReviewerSaved(reviewer_id :str, user_id :str):
    try:
        cur = mysql.connection.cursor()
        check_query = """
            SELECT COUNT(*) 
            FROM `saved_reviewers`
            WHERE `student_id` = %s AND `reviewer_id` = %s;
        """
        cur.execute(check_query, (user_id, reviewer_id))
        return cur.fetchone()[0] == 1
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def saveReviewer(reviewer_id :str, user_id :str):
    try:
        cur = mysql.connection.cursor()
        save_query = """
            INSERT INTO `saved_reviewers` (`student_id`, `reviewer_id`)
            VALUE (%s, %s);
        """
        cur.execute(save_query, (user_id, reviewer_id))
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def unsaveReviewer(reviewer_id :str, user_id :str):
    try:
        cur = mysql.connection.cursor()
        delete_query = """
            DELETE FROM `saved_reviewers`
            WHERE `student_id` = %s AND `reviewer_id` = %s;
        """
        cur.execute(delete_query, (user_id, reviewer_id))
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed


def isNoteSaved(note_id :str, user_id :str):
    try:
        cur = mysql.connection.cursor()
        check_query = """
            SELECT COUNT(*) 
            FROM `saved_notes`
            WHERE `student_id` = %s AND `note_id` = %s;
        """
        cur.execute(check_query, (user_id, note_id))
        return cur.fetchone()[0] == 1
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def saveNote(note_id :str, user_id :str):
    try:
        cur = mysql.connection.cursor()
        save_query = """
            INSERT INTO `saved_notes` (`student_id`, `note_id`)
            VALUE (%s, %s);
        """
        cur.execute(save_query, (user_id, note_id))
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def unsaveNote(note_id :str, user_id :str):
    try:
        cur = mysql.connection.cursor()
        delete_query = """
            DELETE FROM `saved_notes`
            WHERE `student_id` = %s AND `note_id` = %s;
        """
        cur.execute(delete_query, (user_id, note_id))
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed