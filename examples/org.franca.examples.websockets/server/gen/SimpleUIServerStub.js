function SimpleUIServerStub(port) {
	this.wsio = require('websocket.io');
	this.socket = this.wsio.listen(port);
	this.server = new (require('../base/server'))();
	this.title = null;
}

// export the "constructor" function to provide a class-like interface
module.exports = SimpleUIServerStub;

SimpleUIServerStub.prototype.getClients = function() {
	return Objects.keys(this.server.clients);
};

SimpleUIServerStub.prototype.init = function() {
	var _this = this;
	
	_this.socket.on('connection', function(client) {
		_this.server.onConnection(client);
	});
	
	_this.server.on('publishAll', function(topicURI, event) {
		_this.server.publishAll(topicURI, event);
	});
	
	_this.server.on('publishExcludeSingle', function(client, topicURI, event) {
		_this.server.publishExcludeSingle(client, topicURI, event);
	});
	
	_this.server.on('publishEligibleList', function(topicURI, event, eligible) {
		_this.server.publishEligibleList(topicURI, event, eligible);
	});
	
	// RPC stub for the getter of attribute title
	_this.server.rpc('get', function() {
		this.register('title', function(client, cb) {
			cb(null, _this.onGetTitle());
		});
	});
	
	// RPC stub for the setter of attribute title
	_this.server.rpc('set', function() {
		this.register('title', function(client, cb, title) {
			var newValue = _this.onSetTitle(title);
			// send callID back to client
			cb(null, null);
			
			// events will only be sent to subscribed clients if the value has changed
			if (newValue !== this.title) {
				_this.title = newValue;
				_this.server.emit('publishExcludeSingle', client, "signal:title", newValue);
			}
		});
	});
	
	// RPC stub for method setMode
	_this.server.rpc('invoke', function() {
		this.register('setMode', function(client, cb, args) {
			// fireAndForget = false
			var result = _this.setMode(args.shift(), args.shift());
			cb(null, result);
		});
	});
};

SimpleUIServerStub.prototype.updateVelocity = function(data) {
	this.server.emit('publishAll', "broadcast:updateVelocity", data);
};

// definition of enumeration 'Mode'
var Mode = function(){
	return {
		'M_RADIO':0,
		'M_NAVIGATION':1,
		'M_MULTIMEDIA':2,
		'M_SETTINGS':3
	}
}();
module.exports.Mode = Mode;

