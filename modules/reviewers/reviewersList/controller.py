from modules import mysql
from modules.controller import calculate_time_passed

'''
Controllers for the Reviewers List
'''
# Count how many reviewers there are based on the parameters
def countReviewers(owner_id: str, type: str, param: str, privacy: str, order: str, course: str) :
    try:
        cur = mysql.connection.cursor()
        
        # Base SQL query
        fetch_cards = """
            SELECT COUNT(`id`) from `reviewers`
            WHERE `owner_id` = %s 
        """
        fetch_param = [owner_id]

        # Apply filters if any
        if param:
            fetch_cards += " AND `title` COLLATE utf8mb4_bin LIKE %s"
            fetch_param.append(f"%{param}%")

        if type != "All":
            fetch_cards += " AND `type` = %s"
            fetch_param.append(type)

        if privacy != "All":
            fetch_cards += " AND `privacy` = %s"
            fetch_param.append(privacy)

        if course and course != "All Course":
            fetch_cards += " AND `course` = %s"
            fetch_param.append(course)

        fetch_cards += f" ORDER BY `created_on` {order};"
        cur.execute(fetch_cards, tuple(fetch_param))

        return cur.fetchone()[0]
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

# Fetch the reviewers based on the parameters n pieces at a time for pagination
def fetchReviewers(owner_id: str, type: str, param: str, privacy: str, order: str, page: int, items_per_page: int, course: str):
    try:
        cur = mysql.connection.cursor()
        
        # Base SQL query
        fetch_cards = """
            SELECT `id`, `title`, `description`, `type`, `privacy`, `created_on` FROM `reviewers`
            WHERE `owner_id` = %s 
        """
        fetch_param = [owner_id]

        # Apply filters if any
        if course != "All Course":
            fetch_cards += " AND `course` = %s"
            fetch_param.append(course)
            
        if param:
            fetch_cards += " AND `title` COLLATE utf8mb4_bin LIKE %s"
            fetch_param.append(f"%{param}%")

        if type != "All":
            fetch_cards += " AND `type` = %s"
            fetch_param.append(type)

        if privacy != "All":
            fetch_cards += " AND `privacy` = %s"
            fetch_param.append(privacy)


        # Order and limit for pagination
        fetch_cards += f" ORDER BY `created_on` {order} LIMIT %s OFFSET %s"
        offset = (page - 1) * items_per_page
        fetch_param.extend([items_per_page, offset])

        cur.execute(fetch_cards, tuple(fetch_param))
        raw_results = cur.fetchall()

        # Process `created_on` to calculate "time passed"
        processed_results = []
        for row in raw_results:
            id, title, description, type, privacy, created_on = row
            time_passed = calculate_time_passed(created_on)
            processed_results.append((id, title, description, type, privacy, time_passed))

        return processed_results

    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed