from modules import mysql
import base64
import random

def addCard(data :dict):
    try:
        print("Data:", data)
        cur = mysql.connection.cursor()
        insert_q_statement =  """
            INSERT INTO `items` (`reviewer_id`, `number`, `question`, `question_image`)
            VALUE (%s, %s, %s, %s);
        """
        
        cur.execute(insert_q_statement, (data['reviewer_id'], data['number'], data['question'], data['image']))
        mysql.connection.commit()

        insert_a_statement =  """
            INSERT INTO `answers` (`reviewer_id`, `question_number`, `answer_text`, `is_correct`)
            VALUE (%s, %s, %s, %s);
        """
        
        cur.execute(insert_a_statement, (data['reviewer_id'], data['number'], data['correct_answer'], True))
        
        for incorrect in data['incorrect_answers']:
            cur.execute(insert_a_statement, (data['reviewer_id'], data['number'], incorrect, False))
        
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

def fetchMulti(id: str):
    try:
        multi_data = {}
        cur = mysql.connection.cursor()
        
        # Fetch basic flashcard information
        fetch_information = """
            SELECT `title`, `description`, `type`, `privacy`, `owner_id` FROM `reviewers`
            WHERE `id` = %s AND `type` = 'Multiple Choice';
        """
        cur.execute(fetch_information, (id,))
        multi_data['information'] = cur.fetchone()
        
        # Fetch Multiple Choice items and answers
        fetch_questions = """
            SELECT `number`, `question`, `question_image`
            FROM `items`
            WHERE `reviewer_id` = %s ORDER BY `number` ASC;
        """
        cur.execute(fetch_questions, (id,))
        questions = cur.fetchall()
        
        # Structure the flashcard data
        multi_data['cards'] = []
        
        for question in questions:
            fetch_answers = """
                SELECT `answer_text`, `is_correct` 
                FROM `answers` 
                WHERE `reviewer_id` = %s AND `question_number` = %s;
            """
            cur.execute(fetch_answers, (id, question[0]))
            answers = cur.fetchall()

            question_data = {
                'number': question[0],
                'question': question[1],
                'image': base64.b64encode(question[2]).decode('utf-8') if question[2] else None,
                'answer': tuple(random.sample(list(answers), len(answers)))
            }
            multi_data['cards'].append(question_data)
        
        return multi_data
    
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    
    finally:
        cur.close()  # Ensure the cursor is closed