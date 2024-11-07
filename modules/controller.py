from . import mysql


def checkStudent(id :str):
    try:
        cur = mysql.connection.cursor()

        check_query = """
            SELECT COUNT(*) FROM `students` WHERE `id` = %s;
        """
        
        cur.execute(check_query, (id, ))
        return cur.fetchall()[0][0] == 0
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()


# Use this to get the details of the student
def fetchStudent(id :str):
    try:
        cur = mysql.connection.cursor()

        check_query = """
            SELECT * FROM `students` WHERE `id` = %s;
        """
        
        cur.execute(check_query, (id, ))
        return cur.fetchall()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()

def createStudent(student :tuple):
    try:
        cur = mysql.connection.cursor()

        create_query = """
            INSERT INTO `students` (`id`, `name`, `email`)
            VALUES (%s, %s, %s);
        """
        
        cur.execute(create_query, student)
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()