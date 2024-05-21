window.App = () => {
    return {
        'LDA': window.LDA,
        'menuOpen': false,
        'pwdListOpen': true,
        'loginOpen': false,
        'loaderVisible': false,

        'PasswordList': [
            { "id": 1, "value": "Password 1" },
            { "id": 2, "value": "Password 2" },
            { "id": 3, "value": "Password 3" },
        ],
        'passwordFilter':'',
        PasswordListFiltered(){
            
            return this.passwordFilter ? this.PasswordList.filter(a => a.value.toLowerCase().indexOf(this.passwordFilter.toLowerCase())> -1 ) : this.PasswordList
        },
        
        passwordToAdd: '',

        'username': '',
        'password': '', // 
        'expireInDays': 1,
        'errors': '',
        'loggedInUser': '',
        'loginExpiresOn': '',

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
                    this.getPasswords(() => this.getPasswordList())

                }, // OK
                (json) => {
                    this.errors = json.errors
                }, // Error
                () => { this.loaderVisible = false } // Finally
            )

        }, // /login()
        logout(){
            localStorage.removeItem("_lda_token");
            document.location = document.location.toString()
        },
        sortByValue(a, b) {
            if ( a.value < b.value ){
                return -1;
              }
              if ( a.value > b.value ){
                return 1;
              }
              return 0;
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
                        this.PasswordList = json.data//.sort(this.sortByValue)
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
                this.LDA.postStrings('PasswordList', token, [this.passwordToAdd],
                    (json) => {
                        this.PasswordList = json.data
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
                this.LDA.putStrings(pwd.id, token, pwd.value,
                    (json) => {
                        this.PasswordList = json.data
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
                        this.PasswordList = json.data
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