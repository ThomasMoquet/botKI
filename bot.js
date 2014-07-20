var casper = require('casper').create({
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    userAgent: 'LonelyBot'
  }
});


var topicName, postContent, topicId, messageId, content, tpc, title;
var postIdArray = [];
var postIdArray2 = [];

var sqlitemod = require('./sqlite3');

var sqlite = sqlitemod.sqlite3("mysqlite.db");

function setTopicName(topicName){
	this.topicName = topicName;
}
function setPostContent(postContent){
	this.postContent = postContent;
}
function setTopicId(topicId){
	this.topicId = topicId;
}
function setMessageId(messageId){
	this.messageId = messageId;
}
function addToPostIdArray(postIdArray){
	this.postIdArray = this.postIdArray.concat(postIdArray);
}
function addToPostIdArray2(postIdArray){
	this.postIdArray2 = this.postIdArray2.concat(postIdArray);
}
function getPostIdArray(){
	return this.postIdArray;
}
function getPostIdArray2(){
	return this.postIdArray2;
}
function initContent(){
	this.content = "";
}
function addContent(content){
	this.content = this.content + content;
}
function getContent(){
	return this.content;
}
function getTopic(){
	return this.tpc;
}
function setTopic(tpc){
	this.tpc = tpc;
}
function setTitle(title){
	this.title = title;
}
function getTitle(){
	return this.title;
}
function setContent(content){
	this.content = content;
}

function getTopicName(topicId){
	casper.open('http://www.kraland.org/main.php?p=' + topicId);
	casper.then(function(){
		errorMessage = this.evaluate(function() {
		    return document.querySelector(".error h3").innerText;
		});
		if (errorMessage){
			casper.die(errorMessage);
		}
		topicName = this.evaluate(function(){
			if (document.querySelectorAll("h4.ntnb a").length){
				var nodes = document.querySelectorAll("h4.ntnb a");
				return nodes[nodes.length - 1].innerText;
			}
		});	
		setTopicName(topicName);
	});
}
function getTopicNameValue(){
	return this.topicName;
}

function getPostContent(topicId, postId){
	//casper.echo('http://www.kraland.org/main.php?p='+topicId+'&p0=3&p1='+postId);
	casper.open('http://www.kraland.org/main.php?p='+topicId+'&p0=3&p1='+postId);	
	casper.then(function(){
		errorMessage = this.evaluate(function() {
		    return document.querySelector(".error h3").innerText;
		});
		if (errorMessage){
			casper.die(errorMessage);
		}
		postContent = this.evaluate(function(){
			if (document.querySelectorAll(".forum-message textarea[name=message]").length){
				var nodes = document.querySelectorAll(".forum-message textarea[name=message]");
				return nodes[0].value;
			}
		});	
		var utils = require('utils');
		setPostContent(postContent);
	});
}
function getPostContentValue(){
	return this.postContent;
}
function getTopicIdValue(){
	return this.topicId;
}
function getMessageIdValue(){
	return this.messageId;
}

function createTopic(idForum, title, content){
	//casper.echo('http://www.kraland.org/main.php?p='+idForum+'&p0=3');
	casper.open('http://www.kraland.org/main.php?p='+idForum+'&p0=3');
	casper.eachThen([{title:title,content:content}], function(response){
		errorMessage = this.evaluate(function() {
		    return document.querySelector(".error h3").innerText;
		});
		if (errorMessage){
			casper.die(errorMessage);
		}
		this.fill("form[name=post_msg]", {p2:response.data.title, message:response.data.content}, true);
	});
	casper.then(function(){
		/*test = this.evaluate(function(){
			return document;
		})
		this.echo(test.all[0].innerHTML);*/
		this.evaluateOrDie(function() {
		    return /Message Envoyé/.test(document.querySelector(".display h3").innerText);
		}, 'Création topic ratée');
		this.echo('Création topic réussie');
		
		topicId = this.evaluate(function(){
			if (document.querySelectorAll("h4.ntnb > a").length){
				var nodes = document.querySelectorAll("h4.ntnb > a");
				return nodes[nodes.length - 1].getAttribute("href").replace("main.php?p=", "");
			}
		});	
		setTopicId(topicId);
		
		messageId = this.evaluate(function(){
			if (document.querySelectorAll("td.forum-cartouche").length){
				var nodes = document.querySelectorAll("td.forum-cartouche");
				return nodes[nodes.length - 1].childNodes[0].getAttribute("name").replace("msg", "");
			}
		});	
		setMessageId(messageId);
	});
}

function postMessage(topicId, content){
	//casper.echo("http://www.kraland.org/main.php?p="+topicId+"&p0=3");
	casper.open("http://www.kraland.org/main.php?p="+topicId+"&p0=3");
	casper.eachThen([{content:content}], function(response){
		errorMessage = this.evaluate(function() {
		    return document.querySelector(".error h3").innerText;
		});
		if (errorMessage){
			casper.die(errorMessage);
		}
		this.fill("form[name=post_msg]", {message:response.data.content}, true);
	});
	
	casper.then(function(){
		/*test = this.evaluate(function(){
			return document;
		})
		this.echo(test.all[0].innerHTML);*/
		this.evaluateOrDie(function() {
		    return /Message Envoyé/.test(document.querySelector(".display h3").innerText);
		}, 'Création post ratée');
		this.echo('Création post réussie');
		messageId = this.evaluate(function(){
			if (document.querySelectorAll("td.forum-cartouche").length){
				var nodes = document.querySelectorAll("td.forum-cartouche");
				return nodes[nodes.length - 1].childNodes[0].getAttribute("name").replace("msg", "");
			}
		});	
		setMessageId(messageId);
	});
}


function getNewPosts(topicId, pageId, lastPostId) {
	//casper.echo("http://www.kraland.org/main.php?p="+topicId+"_"+pageId);
	casper.open("http://www.kraland.org/main.php?p="+topicId+"_"+pageId);
	casper.then(function(){
		errorMessage = this.evaluate(function() {
		    return document.querySelector(".error h3").innerText;
		});
		if (errorMessage){
			casper.die(errorMessage);
		}
		var postIdArrayNew = this.evaluate(function(lastPostId){
			var postIdArray = [];
			if (document.querySelectorAll("td.forum-cartouche").length){
				var nodes = document.querySelectorAll("td.forum-cartouche");
				for (var i=0; i < nodes.length;i++){					
					var node = nodes[i];
					var idMessage = node.childNodes[0].getAttribute("name").replace("msg", "");
					if (idMessage > lastPostId) {
						postIdArray.push(idMessage);
					}
				};
			}
			return postIdArray;
		}, lastPostId);
		var postIdArray = this.evaluate(function(){
			var postIdArray = [];
			if (document.querySelectorAll("td.forum-cartouche").length){
				var nodes = document.querySelectorAll("td.forum-cartouche");
				for (var i=0; i < nodes.length;i++){					
					var node = nodes[i];
					var idMessage = node.childNodes[0].getAttribute("name").replace("msg", "");
					postIdArray.push(idMessage);
				};
			}
			return postIdArray;
		});
		if (postIdArray.length){
			if (postIdArrayNew.length){
				addToPostIdArray(postIdArrayNew);
			}
			getNewPosts(topicId, pageId + 1, lastPostId);
		}
	});
}


function getNewPosts2(topicId, pageId, lastPostId) {
	//casper.echo("http://www.kraland.org/main.php?p="+topicId+"_"+pageId);
	casper.open("http://www.kraland.org/main.php?p="+topicId+"_"+pageId);
	casper.then(function(){
		errorMessage = this.evaluate(function() {
		    return document.querySelector(".error h3").innerText;
		});
		if (errorMessage){
			casper.die(errorMessage);
		}
		var postIdArrayNew = this.evaluate(function(lastPostId){
			var postIdArray = [];
			if (document.querySelectorAll("td.forum-cartouche").length){
				var nodes = document.querySelectorAll("td.forum-cartouche");
				for (var i=0; i < nodes.length;i++){					
					var node = nodes[i];
					var idMessage = node.childNodes[0].getAttribute("name").replace("msg", "");
					if (idMessage > lastPostId) {
						postIdArray.push(idMessage);
					}
				};
			}
			return postIdArray;
		}, lastPostId);
		var postIdArray = this.evaluate(function(){
			var postIdArray = [];
			if (document.querySelectorAll("td.forum-cartouche").length){
				var nodes = document.querySelectorAll("td.forum-cartouche");
				for (var i=0; i < nodes.length;i++){					
					var node = nodes[i];
					var idMessage = node.childNodes[0].getAttribute("name").replace("msg", "");
					postIdArray.push(idMessage);
				};
			}
			return postIdArray;
		});
		if (postIdArray.length){
			if (postIdArrayNew.length){
				addToPostIdArray2(postIdArrayNew);
			}
			getNewPosts2(topicId, pageId + 1, lastPostId);
		}
	});
}

var topic = function(idTopic){
	getTopic1 = function (){
		return this.topic1;
	}
	setTopic1 = function(value){
		this.topic1 = value;
	}
	getTopic2 = function (){
		return this.topic2;
	}
	setTopic2 = function(value){
		this.topic2 = value;
	}
	getLastPost1 = function (){
		return this.last_post1;
	}
	setLastPost1 = function(value){
		this.last_post1 = value;
	}
	getLastPost2 = function (){
		return this.last_post2;
	}
	setLastPost2 = function(value){
		this.last_post2 = value;
	}
	getStored = function (){
		return this.stored;
	}
	setStored = function(value){
		this.stored = value;
	}
	sqlite.queryArray("SELECT topic1, topic2, last_post1, last_post2 FROM topicSync WHERE topic1='"+idTopic+"'", "SQLITE3_ASSOC", function(result){
		if (result.length){
			setTopic1(result[0]["topic1"]);
			setTopic2(result[0]["topic2"]);
			setLastPost1(result[0]["last_post1"]);
			setLastPost2(result[0]["last_post2"]);
			setStored(true);
		} else {
			setTopic1(idTopic);
			setStored(false);
		}
		casper.echo("data loaded");
	});
	this.syncWith = function(idForum, idTopic){
		idTopic = idTopic ? idTopic : null;
		if (idTopic){
			casper.echo("Create sync : "+getTopic1()+" to "+idTopic);
			setTopic2(idTopic);
			setLastPost1(0);
			setLastPost2(0);
			this.sync();
		} else {
			casper.echo("Create sync : "+getTopic1()+" to "+idForum);
			//Recuperation du nom du sujet
			casper.then(function(){
				getTopicName(getTopic1());
				getNewPosts(getTopic1(), 1, 0);
			});
			casper.then(function(){
				var posts = getPostIdArray();
				initContent();
				casper.eachThen(posts, function(response){
					getPostContent(getTopic1(), response.data);
					casper.then(function(){
						addContent(getPostContentValue());
					});
				});
			});
			//Creation du content
			casper.then(function(){
				createTopic(idForum, getTopicNameValue(), getContent());
			});
			casper.then(function(){
				posts = getPostIdArray();
				setLastPost1(posts[posts.length-1]);
				setTopic2(getTopicIdValue());
				setLastPost2(getMessageIdValue());
				store();
			});
		}
	};
	this.sync = function(){	
		casper.echo("Sync : "+getTopic1()+" to "+getTopic2());
		casper.then(function(){
			getNewPosts(getTopic1(), 1, getLastPost1());
		});
		casper.then(function(){
			getNewPosts2(getTopic2(), 1, getLastPost2());
		});
		casper.then(function(){
			initContent();
			var posts = getPostIdArray();
			casper.eachThen(posts, function(response){
				getPostContent(getTopic1(), response.data);
				casper.then(function(){
					if (getPostContentValue()) addContent(getPostContentValue());
				});
			});
		});
		casper.then(function(){
			if (getContent()){
				casper.then(function(){
					postMessage(getTopic2(), getContent());
				});
				casper.then(function(){
					setLastPost2(getMessageIdValue());
					var posts = getPostIdArray();
					setLastPost1(posts[posts.length-1]);
				});
				casper.then(function(){
					this.echo("Wait 30s");
					this.wait(30000);
				});
			} else {
				casper.echo(getTopic1()+" : no new post");
			}
		});
		casper.then(function(){
			initContent();
			var posts = getPostIdArray2();
			casper.eachThen(posts, function(response){
				getPostContent(getTopic2(), response.data);
				casper.then(function(){
					if (getPostContentValue()) addContent(getPostContentValue());
				});
			});
		});
		casper.then(function(){
			if (getContent()){
				casper.then(function(){
					postMessage(getTopic1(), getContent());
				});
				casper.then(function(){
					setLastPost1(getMessageIdValue());
					var posts = getPostIdArray2();
					if (posts[posts.length-1]> getLastPost2()) setLastPost2(posts[posts.length-1]);		
				});
				casper.then(function(){
					this.echo("Wait 30s");
					this.wait(30000);
				});
			} else {
				casper.echo(getTopic2()+" : no new post");
			}
		});
		casper.then(function(){
			store();
		});
	}
	this.store = function(){
		if (this.stored){
			sqlite.exec("UPDATE topicSync SET topic1 = '"+getTopic1()+"', topic2 = '"+getTopic2()+"', last_post1 = '"+getLastPost1()+"', last_post2 = '"+getLastPost2()+"' WHERE topic1='"+getTopic1()+"'", function(result){
				if (result){
					casper.echo("Update OK");
				} else {
					casper.echo(sqlite.lastErrorMsg());
				}
			});
		} else {
			sqlite.exec("INSERT INTO topicSync (topic1, topic2, last_post1, last_post2) VALUES ('"+getTopic1()+"', '"+getTopic2()+"', '"+getLastPost1()+"', '"+getLastPost2()+"')", function(result){
				if (result){
					casper.echo("Insert OK");
					this.stored = true;
				} else {
					casper.echo(sqlite.lastErrorMsg());
				}
			});
		}
	};
	return this;
}

if (casper.cli.options.init){
	sqlite.exec("DROP TABLE IF EXISTS topicSync;CREATE TABLE topicSync (topic1 STRING NOT NULL, topic2 STRING NOT NULL, last_post1 INT, last_post2 INT);", function(result){
		if (result){
			casper.echo("Initialisation réussie.");
		} else {
			var utils = require('utils');
			utils.dump(result.lastErrorMsg());
		}
		casper.exit();
	});
}

if (casper.cli.options.syncwith){
	var idForum = casper.cli.options.idf;
	var idTopic = casper.cli.options.idt;
	var idTopic2 = casper.cli.options.idt2;
	if (!idForum || !idTopic){
		casper.echo("Use : casperjs bot.js --login=login --pwd=pwd --syncwith --idf=5_5_7 --idt=5_5_7_280541 [--idt2=5_5_7_280959]");
		casper.exit();
	}
	casper.start('http://www.kraland.org/main.php', function() {
	    this.fill('form[action="main.php?p=1&a=100"]', { p1: casper.cli.options.login, p2: casper.cli.options.pwd }, true);
	});
	casper.then(function() {
	    this.evaluateOrDie(function() {
	        return /PROFIL/.test(document.querySelector(".right-boxprofile-header").innerText);
	    }, 'Connection ratée');
	    this.echo('Connection réussie');
	});
	casper.eachThen([{idForum:idForum, idTopic:idTopic, idTopic2:idTopic2}],function(response){
		topic = topic(response.data.idTopic);
		setTopic(topic);
	});
	casper.eachThen([{idForum:idForum, idTopic:idTopic, idTopic2:idTopic2}],function(response){
		topic = getTopic();
		if (topic.getStored()){
			topic.sync();
		} else {
			topic.syncWith(response.data.idForum, response.data.idTopic2);
		}
	});
	casper.run();
}

if (casper.cli.options.sync){
	casper.start('http://www.kraland.org/main.php', function() {
	    this.fill('form[action="main.php?p=1&a=100"]', { p1: casper.cli.options.login, p2: casper.cli.options.pwd }, true);
	});
	casper.then(function() {
	    this.evaluateOrDie(function() {
	        return /PROFIL/.test(document.querySelector(".right-boxprofile-header").innerText);
	    }, 'Connection ratée');
	    this.echo('Connection réussie');
	});
	casper.then(function(){		
		sqlite.queryArray("SELECT * FROM topicSync", "SQLITE3_ASSOC", function(result){
			if (result.length){
				casper.eachThen(result, function(response){
					casper.eachThen([response.data],function(response){
						tpc = topic(response.data.topic1);
						setTopic(tpc);
					});
					casper.then(function(){
						tpc = getTopic();
						if (tpc.getStored()){
							tpc.sync();
						}
					});
				});
			} else {
				casper.echo("No topic to sync");
			}
		});
	});
	casper.run();
}

if (casper.cli.options.desync){
	var idTopic = casper.cli.options.idt;
	if (!idTopic){
		casper.echo("Use : casperjs bot.js --login=login --pwd=pwd --desync --idt=5_5_7_280541");
		casper.exit();
	}
	sqlite.exec("DELETE FROM topicSync WHERE topic1 = '"+idTopic+"';", function(result){
		if (result){
			casper.echo(idTopic+" desynchronisé.");
		} else {
			var utils = require('utils');
			utils.dump(result.lastErrorMsg());
		}
		casper.exit();
	});
}

if (casper.cli.options.list){
	sqlite.queryArray("SELECT * FROM topicSync", "SQLITE3_ASSOC", function(result){
		casper.echo(result.length);
		if (result.length){
			var utils = require('utils'); 
			utils.dump(result);
		} else {
			casper.echo("No topic sync.")
		}
		casper.exit();
	});
}

if (!casper.cli.options.login||!casper.cli.options.pwd){
	casper.echo("You must give login and password :");
	casper.echo("--login : login");
	casper.echo("--pwd : password");
	casper.exit();
}

if (!casper.cli.options.sync && !casper.cli.options.desync && !casper.cli.options.syncwith && !casper.cli.options.init && !casper.cli.options.list){
	casper.echo("You must use these options :");
	casper.echo("--init : initialize the db");
	casper.echo("--sync : sync topics");
	casper.echo("--desync : desync topics");
	casper.echo("--syncwith : add a topic to sync");
	casper.echo("--list : list topics sync");
	casper.exit();
}
