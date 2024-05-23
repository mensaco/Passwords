window.App = () => {
    return {
        'LDA': window.LDA,
        'menuOpen': false,
        'pwdListOpen': true,
        'loginOpen': false,
        'addPwdOpen': false,
        'loaderVisible': false,

        'PasswordList': [
            { id: 5, value: "[\"username\",\"password\",\"url\",\"description\"]" }
        ],
        'passwordFilter': '',
        PasswordListFiltered() {

            const r = this.passwordFilter ? 
                                this.PasswordList.filter(a => 
                                        a.value.join().toLowerCase().indexOf(this.passwordFilter.toLowerCase()) > -1
                                    ) : 
                                this.PasswordList
            return r
        },

        'usernameToAdd': '',
        'passwordToAdd': '',
        'urlToAdd': '',
        'descriptionToAdd': '',

        'username': '',
        'password': '', // 
        'expireInDays': 1,
        'errors': '',
        'loggedInUser': '',
        'loginExpiresOn': '',

        objToPassword(x) {
            //const x = {id: 5, value: "[\"username\",\"password\",\"url\",\"description\"]"}
            let y = Function("return " + x.value)()            
            return {id: x.id, value: y}
        },

        pwdToStringToAdd() {
            const retStr = JSON.stringify([this.usernameToAdd,this.passwordToAdd,this.urlToAdd,this.descriptionToAdd])
            return retStr
        },

        showLogin(hide) {
            this.pwdListOpen = false
            this.loginOpen = hide ? false : true
            this.menuOpen = false
            this.loaderVisible = false
        },
        showPasswords(hide) {
            this.pwdListOpen = hide ? false : true
            this.loginOpen = false
            this.menuOpen = false
        },
        showAddPassword(hide) {            
            this.addPwdOpen = hide ? false : true
            this.pwdListOpen = false
            this.loginOpen = false
            this.menuOpen = false
        },

        init() {
            this.getPasswords(() => this.getUserInfo())
        }, // init()
        getUserInfo() {
            try {
                const token = localStorage.getItem("_lda_token")
                const parts = token.split(/\./)
                if (parts.length > 1) {
                    const decoded = atob(parts[1])
                    var userObject = JSON.parse(decoded)
                    this.loggedInUser = userObject.userName
                    this.loginExpiresOn = new Date(userObject.exp * 1000).toISOString().replace(/[TZ]/g, ' ').substring(0, 19)

                }
            } catch (error) {

            }

        }, // getUserInfo()
        login() {
            this.loaderVisible = true
            this.LDA.authenticate(this.username, this.password, this.expireInDays,
                (json) => {
                    localStorage.setItem("_lda_token", json.message)
                    this.loginOpen = false
                    this.getUserInfo()
                    this.getPasswords(this.showPasswords())

                }, // OK
                (json) => {
                    this.errors = json.errors
                }, // Error
                () => { this.loaderVisible = false } // Finally
            )

        }, // /login()
        logout() {
            localStorage.removeItem("_lda_token");
            document.location = document.location.toString()
        },
        sortByValue(a, b) {
            if (a.value < b.value) {
                return -1;
            }
            if (a.value > b.value) {
                return 1;
            }
            return 0;
        },
        populate(json){
            this.PasswordList = json.data.map(x => this.objToPassword(x))//.sort(this.sortByValue)
        },
        getPasswords(callback) {
            this.loaderVisible = true
            const token = localStorage.getItem("_lda_token")
            if (!token) {
                this.showLogin()
            }
            else {
                this.LDA.getStrings('PasswordList', token,
                    (json) => {
                        this.populate(json)
                        if (callback) {
                            callback()
                        }
                    }, // OK
                    (json) => {
                        this.errors = json.errors
                        this.showLogin()
                    }, // not authenticated
                    (json) => { this.errors = json.errors }, // Error
                    () => { this.loaderVisible = false }, // Finally

                )
            }

        }, // /getPasswords()

        addPassword(callback) {
            this.loaderVisible = true
            const token = localStorage.getItem("_lda_token")
            if (!token) {
                this.showLogin()
            }

            else {
                this.LDA.postStrings('PasswordList', token, [this.pwdToStringToAdd()],
                    (json) => {
                        this.populate(json)
                        this.passwordToAdd = ''
                        if (callback) {
                            callback()
                        }
                    }, // OK
                    (json) => {
                        this.errors = json.errors
                        this.showLogin()
                    }, // not authenticated
                    (json) => { this.errors = json.errors }, // Error
                    () => { this.loaderVisible = false }, // Finally

                )
            }
        }, // /addPassword()        
        updatePassword(pwd, callback) {
            this.loaderVisible = true
            const token = localStorage.getItem("_lda_token")
            if (!token) {
                this.showLogin()
            }
            else {
                this.LDA.putStrings(pwd.id, token, JSON.stringify(pwd.value),
                    (json) => {
                        this.populate(json)
                        if (callback) {
                            callback()
                        }
                    }, // OK
                    (json) => {
                        this.errors = json.errors
                        this.showLogin()
                    }, // not authenticated
                    (json) => { this.errors = json.errors }, // Error
                    () => { this.loaderVisible = false }, // Finally

                )
            }

        }, // /updatePassword()

        deletePassword(pwd, callback) {
            this.loaderVisible = true
            const token = localStorage.getItem("_lda_token")
            if (!token) {
                this.showLogin()
            }
            else {
                this.LDA.deleteStringById(pwd.id, token,
                    (json) => {
                        this.populate(json)
                        if (callback) {
                            callback()
                        }
                    }, // OK
                    (json) => {
                        this.errors = json.errors
                        this.showLogin()
                    }, // not authenticated
                    (json) => { this.errors = json.errors }, // Error
                    () => { this.loaderVisible = false }, // Finally

                )

            }
        }, // /deletePassword()


    }
}