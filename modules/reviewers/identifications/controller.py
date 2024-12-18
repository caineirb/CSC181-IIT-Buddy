from modules import mysql
import base64

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

def fetchIdentification(id: str):
    try:
        identification_data = {}
        cur = mysql.connection.cursor()
        
        # Fetch basic flashcard information
        fetch_information = """
            SELECT `title`, `description`, `type`, `privacy`, `owner_id`, `course` FROM `reviewers`
            WHERE `id` = %s AND `type` = 'Identification';
        """
        cur.execute(fetch_information, (id,))
        identification_data['information'] = cur.fetchone()
        
        # Fetch flashcard items and answers
        fetch_cards = """
            SELECT `i`.`number`, `i`.`question`, `i`.`question_image`, `a`.`answer_text`
            FROM `items` AS `i` 
            LEFT JOIN `answers` AS `a` 
            ON `i`.`reviewer_id` = `a`.`reviewer_id` AND `i`.`number` = `a`.`question_number`
            WHERE `i`.`reviewer_id` = %s ORDER BY `i`.`number` ASC;
        """
        cur.execute(fetch_cards, (id,))
        cards = cur.fetchall()
        
        # Structure the flashcard data
        identification_data['cards'] = []
        
        for card in cards:
            card_data = {
                'number': card[0],
                'question': card[1],
                'image': base64.b64encode(card[2]).decode('utf-8') if card[2] else None,
                'answer': card[3]
            }
            identification_data['cards'].append(card_data)
        
        return identification_data
    
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    
    finally:
        cur.close()  # Ensure the cursor is closed