(function () {
    var HttpProvider = function (host) {
        this.handlers = [];
        this.host = host;
    };

    function formatJsonRpcObject(object) {
        return {
            jsonrpc: '2.0',
            method: object.call,
            params: object.args,
            id: object._id
        }
    };

    function formatJsonRpcMessage(message) {    
        var object = JSON.parse(message);
       
        return {
            _id: object.id,
            data: object.result
        };
    };

    HttpProvider.prototype.send = function (payload) {
        var data = formatJsonRpcObject(payload);

        var request = new XMLHttpRequest();
        request.open("POST", this.host, true);
        request.send(JSON.stringify(data));
        var self = this;
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                self.handlers.forEach(function (handler) {
                    handler.call(self, formatJsonRpcMessage(request.responseText));
                });
            }
        }
    };

    Object.defineProperty(HttpProvider.prototype, "onmessage", {
        set: function (handler) {
            this.handlers.push(handler);
        }
    });

    if (typeof(web3) !== "undefined" && web3.providers !== undefined) {
        web3.providers.HttpProvider = HttpProvider;
    }
})();
