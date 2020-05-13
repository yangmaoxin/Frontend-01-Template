const net = require('net');

class Response {

}

class TrunkedBodyParser {
    constructor() {
        this.initStatus()
        this.length = 0
        this.isFinished = false
        this.content = []

        this.current = this.WAITING_LENGTH
    }
    initStatus() {
        this.statusList = [
            'WAITING_LENGTH',
            'WAITING_LENGTH_LINE_END',
            'READING_TRUNK',
            'WAITING_NEW_LINE',
            'WAITING_NEW_LINE_END',
        ]
        this.statusList.forEach((val, index) => {
            this[val] = index
        })
    }

    nextStatus(status) {
        this.current = status ? this.statusList.indexOf(status) : this.current + 1
    }
    receiveChar(char) {
        if (this.current === this.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true
                }
                this.nextStatus('WAITING_LENGTH_LINE_END')
            } else {
                this.length *= 10
                this.length += char.charCodeAt(0) - '0'.charCodeAt(0)
            }
        } else if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.nextStatus('READING_TRUNK')
            }
        } else if (this.current === this.READING_TRUNK) {
            this.content.push(char)
            this.length--
            if (this.length === 0) {
                this.nextStatus('WAITING_NEW_LINE')
            }
        } else if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.nextStatus('WAITING_NEW_LINE_END')
            }
        } else if (this.current === this.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.nextStatus('WAITING_LENGTH')
            }
        }
    }
}
class ResponseParser {
    constructor() {
        this.initStatus()

        this.current = this.WAITING_STATUS_LINE
        this.statusLine = ""
        this.headers = {}
        this.headerName = ""
        this.headerValue = ""
        this.bodyParser = null
    }
    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished
    }

    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    initStatus() {
        this.statusList = [
            'WAITING_STATUS_LINE',
            'WAITING_STATUS_LINE_END',
            'WAITING_HEADER_NAME',
            'WAITING_HEADER_SPACE',
            'WAITING_HEADER_VALUE',
            'WAITING_HEADER_LINE_END', 
            'WAITING_HEADER_BLOCK_END',
            'WAITING_BODY'
        ]
        this.statusList.forEach((val, index) => {
            this[val] = index
        })
    }

    nextStatus(status) {
        this.current = status ? this.statusList.indexOf(status) : this.current + 1
    }

    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i))
        }

        return this.statusLine
    }
    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.nextStatus('WAITING_STATUS_LINE_END')
            }
            if (char === '\n') {
                this.nextStatus('WAITING_HEADER_NAME')
            } else {
                this.statusLine += char
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.nextStatus('WAITING_HEADER_NAME')
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.nextStatus('WAITING_HEADER_SPACE')
            } else if(char === '\r') {
                this.nextStatus('WAITING_HEADER_BLOCK_END')
                
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new TrunkedBodyParser()
                }
            } else {
                this.headerName += char
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.nextStatus('WAITING_HEADER_VALUE')
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.nextStatus('WAITING_HEADER_LINE_END')
                this.headers[this.headerName] = this.headerValue
                this.headerName = ''
                this.headerValue = ''
            } else {
                this.headerValue += char
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.nextStatus('WAITING_HEADER_NAME')
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.nextStatus('WAITING_BODY')
            }
        } else if (this.current === this.WAITING_BODY) {
            this.bodyParser.receiveChar(char)
        }
    }
}


class Request {
    // method url = host + port + path
    // body: k/v
    // header
    
    constructor(options) {
        this.methods = options.methods || 'GET'
        this.host = options.host
        this.port = options.port || 80
        this.path = options.path || '/'
        this.body = options.body || {}
        this.headers = options.headers || {}

        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }

        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body)
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }

        this.headers['Content-Length'] = this.bodyText.length
    }

    toString() {
        return `
${this.methods} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`
    }

    send(connection) {
        return new Promise((resolve, reject) => {
            const parse = new ResponseParser()
            if (connection) {
                connection.write(this.toString())
            } else {
                connection = net.createConnection({ port: this.port, host: this.host }, () => {
                    connection.write(this.toString())
                })
            }
            connection.on('data', (data) => {
                parse.receive(data.toString())
                if (parse.isFinished) {
                    resolve(parse.response);
                }
                connection.end();
            });
            connection.on('end', () => {
                reject('已从服务器断开');
            });
        })
    }
}

void async function() {
    let request = new Request({
        methods: 'POST',
        host: '127.0.0.1',
        port: '8080',
        body: {
            name: 'winter'
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'marz': 'come in'
        }
    })
    let data = await request.send()
    console.log(data)
}()


/**
 * 响应头报文
 * HTTP 1.1 200 OK  --- status line
 * Content-Type: text/html
 * Date: Mon, 23 Dec 2019 06:46:19 GMT
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * 
 * body
 */