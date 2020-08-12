const regexForUrl = /^https?:\/\/(www\.)?(((?!www)\w([\w-]*\w)?\.)+([a-z]\w*)|(\d{1,3}\.){3}\d{1,3})(:\d+)?\/?(\/\w+)*(\/\w+(\.\w+)?(#|\/)?)*$/;

module.exports = regexForUrl;
