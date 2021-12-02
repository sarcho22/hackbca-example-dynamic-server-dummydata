var express = require('express');
var router = express.Router();

var events_data = require('../data/dummy_events');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'HackBCA 20XX',
                        layout: "layout", // this shows how the default layout template (layout.hbs) can be overridden.
                        style: "index",   // this specifies the stylesheet index.css should be injected (see layout.hbs)
                        num_events: events_data.length    // this is some injected data.
                      });
});

module.exports = router;
