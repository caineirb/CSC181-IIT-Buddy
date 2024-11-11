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

def addCard(data :dict):
    try:
        cur = mysql.connection.cursor()
        insert_q_statement =  """
            INSERT INTO `items` (`reviewer_id`, `number`, `question`, `question_image`)
            VALUE (%s, %s, %s, %s);
        """
        
        cur.execute(insert_q_statement, (data['reviewer_id'], data['number'], data['definition'], data['image']))
        mysql.connection.commit()

        insert_a_statement =  """
            INSERT INTO `answers` (`reviewer_id`, `question_number`, `answer_text`, `is_correct`)
            VALUE (%s, %s, %s, %s);
        """
        
        cur.execute(insert_a_statement, (data['reviewer_id'], data['number'], data['term'], True))
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def removeCards(id :str):
    try:
        cur = mysql.connection.cursor()
        delete_q_statement =  """
            DELETE FROM `items` WHERE `reviewer_id` = %s;
        """
        
        cur.execute(delete_q_statement, (id, ))
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed

def editFlashcard(data :dict):
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

import base64

def fetchFlashcard(id: str):
    try:
        flashcard_data = {}
        cur = mysql.connection.cursor()
        
        # Fetch basic flashcard information
        fetch_information = """
            SELECT `title`, `description`, `type`, `privacy`, `owner_id` FROM `reviewers`
            WHERE `id` = %s AND `type` = 'Flashcard';
        """
        cur.execute(fetch_information, (id,))
        flashcard_data['information'] = cur.fetchone()
        
        # Fetch flashcard items and answers
        fetch_cards = """
            SELECT `i`.`number`, `i`.`question`, `i`.`question_image`, `a`.`answer_text`
            FROM `items` AS `i` 
            LEFT JOIN `answers` AS `a` 
            ON `i`.`reviewer_id` = `a`.`reviewer_id` AND `i`.`number` = `a`.`question_number`
            WHERE `i`.`reviewer_id` = %s;
        """
        cur.execute(fetch_cards, (id,))
        cards = cur.fetchall()
        
        # Structure the flashcard data
        flashcard_data['cards'] = []
        
        for card in cards:
            card_data = {
                'number': card[0],
                'question': card[1],
                'image': base64.b64encode(card[2]).decode('utf-8') if card[2] else None,
                'answer': card[3]
            }
            flashcard_data['cards'].append(card_data)
        
        return flashcard_data
    
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

def fetchPreview(owner_id :str):
    try:
        cur = mysql.connection.cursor()
        fetch_id = """
            SELECT `id`, `title`, `description`, `type`, `privacy`, `owner_id` 
            FROM `reviewers`
            WHERE `owner_id` = %s AND `type` = 'Flashcard'
            ORDER BY `created_on` DESC
            LIMIT 5;
        """

        cur.execute(fetch_id, (owner_id,))
        return cur.fetchall()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()  # Ensure the cursor is closed
		
def fetchFlashcardInfo(id :str):
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