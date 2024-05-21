window.LDA = {}

// a common part for all endpoint calls
LDA.handleResponse = (response, callbackOk, callbackNotAuthorized, callbackError, callbackFinally) => {
    if (response.status == 401) {
        var json = {
            succeeded: false,
            errors: 'Not authorized.'
        }
        if(callbackNotAuthorized){
            callbackNotAuthorized(json);
        }        
    }
    else {
        response.json()
            .then(json => {
                if (json.succeeded) {
                    if (callbackOk) {
                        // at this point json contains the authentication token
                        callbackOk(json);
                    }
                } else {
                    if (callbackError) {
                        // at this point the json contains eventual error messages
                        callbackError(json);
                    }
                }
            })
            .catch((json) => {
                if (callbackError) {
                    // at this point the json contains eventual error messages
                    callbackError(json);
                }
            })
            .finally(() => {
                if (callbackFinally) {
                    // call finalizing callback here
                    callbackFinally();
                }
            });
    }

}

// headers for all authorized requests
LDA.HEADERS = (token) => {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

LDA.authenticate = (username, password, expireInDays, callbackOk, callbackError, callbackFinally) => {
    fetch('https://littledataapi.com/Users/Authenticate', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password,
            expireInDays: expireInDays,
        })
    })
        .then(response =>
            LDA.handleResponse(response, callbackOk, () => { }, callbackError, callbackFinally))
}


LDA.register = (username, password, callbackOk, callbackError, callbackFinally) => {
    fetch('https://littledataapi.com/Users/Register', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: username,
            password: password
        })
    })
        .then(response =>
            LDA.handleResponse(response, callbackOk, () => { } , callbackError, callbackFinally))
}


LDA.getStrings = (listName, token, callbackOk, callbackNotAuthorized, callbackError, callbackFinally) => {
    fetch(`https://littledataapi.com/api/LittleData/GetStrings?listName=${listName}`, {
        method: 'GET',
        headers: LDA.HEADERS(token)
    })
        .then(response =>
            LDA.handleResponse(response, callbackOk, callbackNotAuthorized, callbackError, callbackFinally))
}


LDA.postStrings = (listName, token, stringArrayToAdd, callbackOk, callbackNotAuthorized, callbackError, callbackFinally) => {
    fetch(`https://littledataapi.com/api/LittleData/PostStringData`, {
        method: 'POST',
        headers: LDA.HEADERS(token),
        body: JSON.stringify({
            "name": listName,
            "values": stringArrayToAdd
        })
    })
        .then(response =>
            LDA.handleResponse(response, callbackOk, callbackNotAuthorized, callbackError, callbackFinally))
}

LDA.putStrings = (id, token, value, callbackOk, callbackNotAuthorized, callbackError, callbackFinally) => {
    fetch(`https://littledataapi.com/api/LittleData/UpdateStringById?id=${id}&value=${value}`, {
        method: 'PUT',
        headers: LDA.HEADERS(token)
    })
        .then(response =>
            LDA.handleResponse(response, callbackOk, callbackNotAuthorized, callbackError, callbackFinally))
}


LDA.deleteStringById = (id, token, callbackOk, callbackNotAuthorized, callbackError, callbackFinally) => {
    fetch(`https://littledataapi.com/api/LittleData/DeleteStringById?id=${id}`, {
        method: 'DELETE',
        headers: LDA.HEADERS(token)
    })
        .then(response =>
            LDA.handleResponse(response, callbackOk, callbackNotAuthorized, callbackError, callbackFinally))
}
