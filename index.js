const async = require('async');
const request = require('request');
const _ = require('underscore');
const events = require('events');
const util = require('util');
const http = require('http');
const formidable = require('formidable');
//var express  = require('express');
//var expressapp=exports.app=express();

console.log("Check that I can edit"); 
// config { token:groupme token,
//          group:the room to connect to,
//          name: the bot name,
//          url: optional callback,
//          avatar_url: optional avatar image
function Bot(config) {
  if (!(this instanceof Bot)) return new Bot(config);
  for (var key in config)
    if (config.hasOwnProperty(key)) this[key] = config[key];
  if (this.token && this.group && this.name) {
    console.log("registering the bot in the Bot(config) method");
    this.registerBot();
  } else {
    console.log("pass me config so you can actually be a bot");
  }
};

util.inherits(Bot, events.EventEmitter);


Bot.prototype.app=function(app, request,response){
  var self=this;
  console.log("app called.");

    app.post('/incoming',function(request,response){
      console.log("app receive the post. gonna post soon");
    

      var form = new formidable.IncomingForm();
      var messageFields = {};
      form.parse(request, function(err, fields, files) {
        if (err) console.error("bad incoming data " + err);
      });

      form.on('field', function(name, value) {
        messageFields[name] = value;
      });

      form.on('end', function() {
        response.writeHead(200, {
          "Content-Type": "text/plain"
        });
        response.end("THANKS");
        if (typeof messageFields.payload !== 'undefined') {
          self.emit('botImage', self, {
            url: messageFields.payload.url,
            picture_url: messageFields.payload.picture_url,
            payload: messageFields.payload
          });
        } else {
          self.emit('botMessage', self, {
            attachments: messageFields.attachments,
            avatar_url: messageFields.avatar_url,
            created_at: messageFields.created_at,
            group_id: messageFields.group_id,
            id: messageFields.id,
            name: messageFields.name,
            sender_id: messageFields.sender_id,
            sender_type: messageFields.sender_type,
            source_guid: messageFields.source_guid,
            system: messageFields.system,
            text: messageFields.text,
            user_id: messageFields.user_id,
            payload: messageFields.payload
          });
        }
      });


  });


};


// start the web server
// arg: address to serve on
Bot.prototype.serve = function(address) {
  var self = this;
  var server = http.createServer(function(request, response) {
    

    if (request.url == '/' && request.method == 'GET') {
      response.writeHead(200, {
        "Content-Type": "application/json"
      });
      response.end(JSON.stringify({
        'name': self.name,
        'group': self.group
      }));
    } 



    else if (request.url == '/incoming' && request.method == 'POST') {
      var form = new formidable.IncomingForm();
      var messageFields = {};
      form.parse(request, function(err, fields, files) {
        if (err) console.error("bad incoming data " + err);
      });

      form.on('field', function(name, value) {
        messageFields[name] = value;
      });

      form.on('end', function() {
        response.writeHead(200, {
          "Content-Type": "text/plain"
        });
        response.end("THANKS");
        if (typeof messageFields.payload !== 'undefined') {
          self.emit('botImage', self, {
            url: messageFields.payload.url,
            picture_url: messageFields.payload.picture_url,
            payload: messageFields.payload
          });
        } else {
          self.emit('botMessage', self, {
            attachments: messageFields.attachments,
            avatar_url: messageFields.avatar_url,
            created_at: messageFields.created_at,
            group_id: messageFields.group_id,
            id: messageFields.id,
            name: messageFields.name,
            sender_id: messageFields.sender_id,
            sender_type: messageFields.sender_type,
            source_guid: messageFields.source_guid,
            system: messageFields.system,
            text: messageFields.text,
            user_id: messageFields.user_id,
            payload: messageFields.payload
          });
        }
      });

    } else {
      response.writeHead(404, {
        "Content-Type": "text/plain"
      });
      response.end("NOT FOUND");
    }

  }.bind(this));

 // server.listen(address);
};


Bot.prototype.serve2 = function(app, request , response) {
  var self = this;
  console.log("serve2 running.")
  //var server = http.createServer(function(request, response) {
    if (request.url == '/' && request.method == 'GET') {
      response.writeHead(200, {
        "Content-Type": "application/json"
      });
      response.end(JSON.stringify({
        'name': self.name,
        'group': self.group
      }));
    } else if (request.url == '/incoming' && request.method == 'POST') {
      console.log("serve2 receive the post. gonna post soon \n ");
       
       console.log(util.inspect(request, {showHidden: false, depth: null}));
       
       
       
      var form = new formidable.IncomingForm();
      var messageFields = {};
      form.parse(request, function(err, fields, files) {
        if (err){
         console.error("bad incoming data " + err);
         console.log(util.inspect(fields, {showHidden: false, depth: null}));
         console.log(util.inspect(files, {showHidden: false, depth: null}));
         
       }
      });

      form.on('field', function(name, value) {
        messageFields[name] = value;
      });

      form.on('end', function() {
        response.writeHead(200, {
          "Content-Type": "text/plain"
        });
        response.end("THANKS");
        if (typeof messageFields.payload !== 'undefined') {
          self.emit('botImage', self, {
            url: messageFields.payload.url,
            picture_url: messageFields.payload.picture_url,
            payload: messageFields.payload
          });
        } else {
          self.emit('botMessage', self, {
            attachments: messageFields.attachments,
            avatar_url: messageFields.avatar_url,
            created_at: messageFields.created_at,
            group_id: messageFields.group_id,
            id: messageFields.id,
            name: messageFields.name,
            sender_id: messageFields.sender_id,
            sender_type: messageFields.sender_type,
            source_guid: messageFields.source_guid,
            system: messageFields.system,
            text: messageFields.text,
            user_id: messageFields.user_id,
            payload: messageFields.payload
          });
        }
      });

    } 

  //}.bind(this));

  //server.listen(address);   http://stackoverflow.com/questions/8514106/how-to-mount-express-js-sub-apps
};





// make the bot say something
Bot.prototype.message = function(_message) {
  var url = 'https://api.groupme.com/v3/bots/post';
  var package = {};
  package.text = _message;
  package.bot_id = this.botId;
  request({
    url: url,
    method: 'POST',
    body: JSON.stringify(package)
  });
};

// destroys a bot by id, if no bot_id is sent, unregisters itself
Bot.prototype.unRegister = function(bot_id, callback) {
  var url = 'https://api.groupme.com/v3/bots/destroy?token=' + this.token;
  request({
      url: url,
      method: 'POST',
      body: JSON.stringify({
        bot_id: bot_id
      })
    },
    function(error, response, body) {
      callback();
    });
};

// get a list of registered bots
Bot.prototype.allBots = function(callback) {
  var url = 'https://api.groupme.com/v3/bots?token=' + this.token;
  request({
    url: url,
    method: 'GET'
  }, function(err, response, body) {
    body = JSON.parse(body);
    var bots = [];
    _.each(body.response, function(bot) {
      bots.push(bot);
    });
    if (callback) callback(bots);
  });
};

// kill all bots, this is a big deal. Use with caution
Bot.prototype.killAllBots = function(callback) {
  this.allBots(function(listOfBots) {
    _.each(listOfBots, function(bot) {
      this.unRegister(bot.bot_id);
    });
  }.bind(this));
  if (callback) callback("done");
};

// register the bot with groupme, but first kill any bots in this room with this name.
Bot.prototype.registerBot = function() {
  async.waterfall([
    // get a list of the bots
    function(callback) {
      var self = this;
      this.allBots(function(bots) {
        var botsToKill = [];
        _.each(bots, function(bot) {
          if (bot.group_id == self.group && bot.name == self.name) {
            botsToKill.push(bot.bot_id);
          }
        });
        callback(null, botsToKill);
      });
    }.bind(this),

    // kill the bots
    function(botsToKill, callback) {
      async.each(botsToKill, this.unRegister.bind(this));
      callback();
    }.bind(this),

    // register the new bot
    function(callback) {
      var bot = {};
      bot.name = this.name;
      bot.group_id = this.group;
      if (this.url) {
        bot.callback_url = this.url + '/incoming';
      };
      if (this.avatar_url) {
        bot.avatar_url = this.avatar_url;
      };
      var url = 'https://api.groupme.com/v3/bots?token=' + this.token;
      request({
          url: url,
          method: 'POST',
          body: JSON.stringify({
            bot: bot
          })
        },
        function(error, response, body) {
          if (!error) {
            var parsedBody = JSON.parse(body).response.bot;
            callback(null, parsedBody.bot_id);
          } else {
            callback(error);
          }
        }
      );
    }.bind(this)
  ], function(err, bot_id) {
    this.botId = bot_id;
    this.emit('botRegistered', this);
  }.bind(this));
};

module.exports = Bot;
