const bcrypt = require("bcrypt");

class Utils {
    static isAllLetter(inputtxt) {
        var letters = /^[A-Za-z ]+$/;
        if (inputtxt.match(letters)) {
            return true;
        }
        else {
            return false;
        }
    }
    static isAllNumber(inputtxt) {
        var letters = /^[0-9]+$/;
        if (inputtxt.match(letters)) {
            return true;
        }
        else {
            return false;
        }
    }
    static checkPasswordValidation = async (value) => {
        const isWhitespace = /^(?=.*\s)/;
        const isContainsUppercase = /^(?=.*[A-Z])/;
        const isContainsLowercase = /^(?=.*[a-z])/;
        const isContainsNumber = /^(?=.*[0-9])/;
        const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
        const isValidLength = /^.{8,16}$/;
        let isStrong = true, response;

        if (isWhitespace.test(value)) {
            isStrong = false;
            response = "Password must not contain Whitespaces.";
        }
        if (!isContainsUppercase.test(value)) {
            isStrong = false;
            response = "Password must have at least one Uppercase Character.";
        }
        if (!isContainsLowercase.test(value)) {
            isStrong = false;
            response = "Password must have at least one Lowercase Character.";
        }
        if (!isContainsNumber.test(value)) {
            isStrong = false;
            response = "Password must contain at least one Digit.";
        }
        if (!isContainsSymbol.test(value)) {
            isStrong = false;
            response = "Password must contain at least one Special Symbol.";
        }
        if (!isValidLength.test(value)) {
            isStrong = false;
            response = "Password must be 8-16 Characters Long.";
        }
        return { isStrong, response }
    }
    static ValidateEmail(mail) {
        let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (mail.match(mailformat)) {
            return true;
        }
        return false;
    }
    static ValidatePhoneNumber(number) {
        var phoneno = /^[0-9]{10}/;
        if (number.match(phoneno)) {
            return true;
        }
        return false;
    }
    static hashPassword = async (password) => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }
    static matchPassword = async (newPassword, password) => {
        return await bcrypt.compare(newPassword, password);
    }
    static generateUsername() {
        var string = 'abcdefghijklmnopqrestuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let username = '';
        var len = string.length;
        for (let i = 0; i < 6; i++) {
            username += string[Math.floor(Math.random() * len)];
        }
        return username;
    }
    static generatePassword() {
        var string = 'abcdefghijklmnopqrestuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789!@#$%^&*()--+={}';
        let password = '';
        var len = string.length;
        for (let i = 0; i < 8; i++) {
            password += string[Math.floor(Math.random() * len)];
        }
        return password;
    }

}

module.exports = { Utils }