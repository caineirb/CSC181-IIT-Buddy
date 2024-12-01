from modules import mysql
from modules.controller import calculate_time_passed

def createReviewer(data :dict):
    try:
        cur = mysql.connection.cursor()
        insert_statement =  """
            INSERT INTO `reviewers` (`title`, `type`, `privacy`, `owner_id`)
            VALUE (%s, %s, %s, %s);
        """
        
        cur.execute(insert_statement, (data['title'], data['type'], data['privacy'], data['owner_id']))
        mysql.connection.commit()
        
        fetch_id = """
            SELECT `id` FROM `reviewers`
            WHERE `title` = %s AND `type` = %s AND `privacy` = %s AND `owner_id` = %s;
        """

        cur.execute(fetch_id, (data['title'], data['type'], data['privacy'], data['owner_id']))
        return cur.fetchone()[0]
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def editReviewerInfo(data :dict):
    try:
        cur = mysql.connection.cursor()
        update_statement =  """
            UPDATE `reviewers`
            SET `title` = %s, `description` = %s, `type` = %s, `privacy` = %s
            WHERE `id` = %s;
        """
        
        cur.execute(update_statement, (data['title'], data['description'], data['type'], data['privacy'], data['id']))
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def deleteReviewer(id :str, type :str):
    try:
        cur = mysql.connection.cursor()
        delete_statement =  """
            DELETE FROM `reviewers` WHERE `id` = %s AND `type` = %s;
        """
        
        cur.execute(delete_statement, (id, type))
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

# Get 5 reviewers for the main display
def fetchPreview(owner_id :str):
    try:
        cur = mysql.connection.cursor()
        fetch_id = """
            SELECT `id`, `title`, `type`, `privacy`, `created_on`
            FROM `reviewers`
            WHERE `owner_id` = %s
            ORDER BY `created_on` DESC
            LIMIT 5;
        """

        cur.execute(fetch_id, (owner_id,))
        raw_results = cur.fetchall()

        # Process `created_on` to calculate "time passed"
        processed_results = []
        for row in raw_results:
            id, title, type, privacy, created_on = row
            time_passed = calculate_time_passed(created_on)
            processed_results.append((id, title, type, privacy, time_passed))

        return processed_results
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed
		
def fetchReviewerInfo(id :str, type :str):
    try:
        cur = mysql.connection.cursor()
        fetch_id = """
            SELECT `id`, `title`, `description`, `type`, `privacy`, `owner_id` 
            FROM `reviewers`
            WHERE `id` = %s and `type` = %s;
        """
        cur.execute(fetch_id, (id, type))
        return cur.fetchone()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def checkDuplicateTitle(title :str, type :str, id :str = None):
    try:
        cur = mysql.connection.cursor()
        fetch_count = """
            SELECT COUNT(`title`) FROM `reviewers`
            WHERE `title` = %s AND `type` = %s
        """
        fetch_param = [title, type]
        if id:
            fetch_count += " AND NOT (`id` = %s);"
            fetch_param.append(id)

        cur.execute(fetch_count, tuple(fetch_param))
        return cur.fetchone()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed


def customErrorMessages(error):
    if error.args[0] == 1062:  # Check the error code first
        try:
            types = ["Flashcard", "Identification", "Multiple Choice", "Mixed"]
            # Extract the duplicate value from the error message
            value = error.args[1].split("'")[1]
            
            # Split the value by dashes
            parts = value.split("-")
            
            # Extract the type and the name
            entry_type = parts[-1]  # Last part

            if entry_type not in types:
                return "Reviewer with the same name and type already exist."

            name = "-".join(parts[:-2])  # Join all but the last two parts
            
            return f"{entry_type} named '{name}' already exists."
        except (IndexError, ValueError) as e:
            # Handle unexpected splitting issues
            return "An unexpected error occurred while processing the duplicate entry."
    else:
        return f"Error {error.args[0]} occurred. Please contact the developers."