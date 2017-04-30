var db = require('./database');

var application = {
		/*---------------CREATE-----------------*/
		create : function(application, callback){
		return db.query('INSERT INTO application SET ?', application, callback);
	},

		// All entries in the database.
		getAll : function(callback){
			return db.query('select * from application order by creation_date desc',[], callback);
	},

		// Single pain entry.
		get : function(id, callback){
		return db.query('select question.q_text, answer.ans_text from question, answer, application where answer.app_id = application.id and answer.q_id = question.id and application.id =?',[id], callback);
	}

};
module.exports = application;