class ApiModel{
    static getApiModel = (status, message, data ) => {
        return {status: status, message: message, data: data }
    }
}
module.exports = ApiModel;