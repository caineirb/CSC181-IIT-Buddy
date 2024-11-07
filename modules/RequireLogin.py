from functools import wraps
from flask import session, redirect, url_for


'''
Sample Function that need login to access:


@app.route('/sample')
@RequireLogin(redirect_endpoint='index') <-- Butangi ninyo ani, para mu redirect sa index
def sample():
    chuchu

'''
class RequireLogin:
    def __init__(self, redirect_endpoint):
        self.redirect_endpoint = redirect_endpoint

    def __call__(self, func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            if 'user-id' not in session:
                return redirect(url_for(self.redirect_endpoint))
            return func(*args, **kwargs)
        return decorated_function