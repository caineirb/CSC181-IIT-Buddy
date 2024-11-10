from modules import mysql


def createFlashcard(data :dict):
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


def fetchFlashcard(id :str):
    try:
        cur = mysql.connection.cursor()
        fetch_id = """
            SELECT `title`, `description`, `type`, `privacy`, `owner_id` FROM `reviewers`
            WHERE `id` = %s and `type` = 'Flashcard';
        """

        cur.execute(fetch_id, (id,))
        return cur.fetchone()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed


def fetchFlashcards(owner_id :str):
    try:
        cur = mysql.connection.cursor()
        fetch_id = """
            SELECT `id`, `title`, `description`, `type`, `privacy`, `owner_id` FROM `reviewers`
            WHERE `owner_id` = %s and `type` = 'Flashcard';
        """

        cur.execute(fetch_id, (owner_id,))
        return cur.fetchall()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed