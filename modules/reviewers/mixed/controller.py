from modules import mysql
import base64
import random

def addCard(data :dict):
    try:
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
        
        if data['type'] == "Multiple Choice":
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

def fetchMixed(id: str):
    try:
        mixed_data = {}
        cur = mysql.connection.cursor()
        
        # Fetch basic flashcard information
        fetch_information = """
            SELECT `title`, `description`, `type`, `privacy`, `owner_id`, `course` FROM `reviewers`
            WHERE `id` = %s AND `type` = 'Mixed';
        """
        cur.execute(fetch_information, (id,))
        mixed_data['information'] = cur.fetchone()
        
        # Fetch Mixed items and answers
        fetch_questions = """
            SELECT `number`, `question`, `question_image`
            FROM `items`
            WHERE `reviewer_id` = %s ORDER BY `number` ASC;
        """
        cur.execute(fetch_questions, (id,))
        questions = cur.fetchall()
        
        # Structure the flashcard data
        mixed_data['cards'] = []
        
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
                'type': "Multiple Choice" if len(answers) > 1 else "Identification",
                'question': question[1],
                'image': base64.b64encode(question[2]).decode('utf-8') if question[2] else None,
                'answer': list(answers)
            }
            if question_data['type'] == "Multiple Choice":
                question_data['answer'] = tuple(random.sample(question_data['answer'], len(question_data['answer'])))
            mixed_data['cards'].append(question_data)
        
        return mixed_data
    
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    
    finally:
        cur.close()  # Ensure the cursor is closed