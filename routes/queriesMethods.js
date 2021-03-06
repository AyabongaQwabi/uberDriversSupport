module.exports = function(io){
    this.showQueries = function (req, res, next) {
      req.services(function(err, services){
    		var queriesDataServ = services.queriesDataServ;
        queriesDataServ.getDriverQueries(req.session.user.id, function(err, rows){
          if(err)	throw err;
            res.render( 'queries', {
                queries : rows,
                user: req.session.user,
                role : "Driver"
            });
        });
    });
    };

    this.showAddQuery = function (req, res, next) {
        res.render('newQuery', {
            user: req.session.user
        });
    };
    this.showQuery = function (req, res, next) {
      req.services(function(err, services){
    		var queriesDataServ = services.queriesDataServ;
        var query_id = req.params.query_id;
        queriesDataServ.getDriverQueries(query_id, function(err, rows){
          if(err)	throw err;
            res.render( 'query', {
                queries : rows,
                user: req.session.user,
                role : "Driver"
            });
        });
    });
    };
    this.addQuery = function (req, res, next) {
      req.services(function(err, services){
    		var queriesDataServ = services.queriesDataServ;
        var input = JSON.parse(JSON.stringify(req.body));
        var query = input.query[0];
        var driver_id = req.session.user.id;

        queriesDataServ.insertQuery([driver_id, query], function(err, rows){
          if(err)	throw err;
          //io.emit("query_added", rows.insertId);
          queriesDataServ.getQueryByQueryId(rows.insertId, function(err, results){
            io.emit("query_added", results[0]);
          })
          res.redirect('/queries');
        });
    });
  };

  this.acceptQuery = function (req, res, next) {
    req.services(function(err, services){

      var queryId = req.params.id;

      //get the agent id
      var queriesDataServ = services.queriesDataServ;
      queriesDataServ.getDriver(queryId, function(err, rows){
        io.emit('query_accepted', {
          query_id : queryId,
          username : rows[0].username,
          agent : req.session.agent.username });
      });
      queriesDataServ.getQueries(req.session.agent.id, function(err, rows){
        if(err)	throw err;
          res.render( 'agentQueries', {
              queries : rows,
              user: req.session.agent,
              role : "Agent"

          });
      });
  });
};

    this.updateQuery = function (req, res, next) {
      req.services(function(err, services){
    		var queriesDataServ = services.queriesDataServ;
        var cat_id = req.params.cat_id;
        var input = JSON.parse(JSON.stringify(req.body));
        var data = {
            cat_name : input.cat_name
        };
        queriesDataServ.updatequeries([data, cat_id], function(err, results) {
              if (err) return next(err);
              res.redirect('/queries');
        });
    });
  };

    this.getSearchqueries = function(req, res, next){
      req.services(function(err, services){
    		var queriesDataServ = services.queriesDataServ;
        var searchValue = req.params.searchValue;
        searchValue = "%" + searchValue + "%";
        queriesDataServ.searchqueries([searchValue], function(err, results){
            if (err) return next(err);
            res.render('queries_list', {
                admin: admin,
                user: req.session.user,
                categories : results,
                layout : false
            });
        });
    });
  };
}
