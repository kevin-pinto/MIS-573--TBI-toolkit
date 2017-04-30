var db = require('./database');

var answer = {
		/*---------------CREATE-----------------*/
		create : function(answer, callback){
		return db.query('INSERT INTO answer SET ?', answer, callback);
	},
		
		// Single answer.
		get : function(id, callback){
		return db.query('select * from answer where id=?',[id], callback);
	},

		update : function(answer, callback){
		return db.query("update answer set ans_text=? where app_id=? and q_id=?",[answer.ans_text, answer.app_id, answer.q_id], callback);
	}
	
};
module.exports = answer;