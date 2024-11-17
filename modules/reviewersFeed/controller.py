from modules import mysql
from datetime import datetime
from modules.controller import fetchStudent
'''
Controllers for the Reviewers List
'''

# Count how many reviewers there are based on the parameters
def countReviewers(owner_id: str, type: str, param: str, order: str):
    try:
        cur = mysql.connection.cursor()
        
        # Base SQL query
        fetch_cards = """
            SELECT COUNT(`id`) from `reviewers`
            WHERE `owner_id` = %s AND `privacy` = "Public"
        """
        fetch_param = [owner_id]

        # Apply filters if any
        if param:
            fetch_cards += " AND `title` COLLATE utf8mb4_bin LIKE %s"
            fetch_param.append(f"%{param}%")

        if type != "All":
            fetch_cards += " AND `type` = %s"
            fetch_param.append(type)

        fetch_cards += f" ORDER BY `created_on` {order};"
        cur.execute(fetch_cards, tuple(fetch_param))

        return cur.fetchone()[0]
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

# Fetch the reviewers based on the parameters n pieces at a time for pagination
def fetchReviewers(owner_id: str, type: str, param: str, order: str, page: int, items_per_page: int):
    try:
        cur = mysql.connection.cursor()
        
        # Base SQL query
        fetch_cards = """
            SELECT `id`, `title`, `type`, `created_on`, `owner_id` FROM `reviewers`
            WHERE `owner_id` = %s AND `privacy` = "Public"
        """
        fetch_param = [owner_id]

        # Apply filters if any
        if param:
            fetch_cards += " AND `title` COLLATE utf8mb4_bin LIKE %s"
            fetch_param.append(f"%{param}%")

        if type != "All":
            fetch_cards += " AND `type` = %s"
            fetch_param.append(type)

        # Order and limit for pagination
        fetch_cards += f" ORDER BY `created_on` {order} LIMIT %s OFFSET %s"
        offset = (page - 1) * items_per_page
        fetch_param.extend([items_per_page, offset])

        cur.execute(fetch_cards, tuple(fetch_param))
        raw_results = cur.fetchall()

        # Process `created_on` to calculate "time passed"
        processed_results = []
        for row in raw_results:
            id, title, type, created_on, owner_id = row
            time_passed = calculate_time_passed(created_on)
            owner_name = fetchStudent(owner_id)[0][1]
            processed_results.append((id, title, type, time_passed, owner_name))

        return processed_results

    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed


# For the datetime data displayed in the reviewer cards
def calculate_time_passed(datetime_value):
    """Calculate the time passed from a datetime value to now."""
    current_time = datetime.now()
    time_difference = current_time - datetime_value

    if time_difference.days > 0:
        return f"{time_difference.days} days ago" if time_difference.days > 1 else f"{time_difference.days} day ago"
    elif time_difference.total_seconds() >= 3600:
        hours = int(time_difference.total_seconds() // 3600)
        return f"{hours} hours ago" if hours > 1 else f"{hours} hour ago"
    elif time_difference.total_seconds() >= 60:
        minutes = int(time_difference.total_seconds() // 60)
        return f"{minutes} minutes ago" if minutes > 1 else f"{minutes} minute ago"
    else:
        return "Just now"