var express = require('express');
var router = express.Router();
module.exports = router; //This line is sometimes placed at the bottom, but it doesn't really matter.

// Import dummy events data 
//TODO: In the future, instead of maintaining the data in server memory, a separate database
//      will be maintained and queried 
var events_data = require('../data/dummy_events');

/* GET main events page. */
router.get('/', function (req, res, next) {
  // Read sort and filter query params if they exist
  var sort = req.query.sort || "Date / Time";
  var filter = req.query.filter || "None";
  //TODO: In the future, actually filter or sort the events data based on query params
  //      A real database will make that easy

  res.render('events', { title: 'Events', 
                        style: "tables", 
                        events: events_data, 
                        sort: sort,
                        filter: filter});
});

/* GET detailed event page */
router.get('/:event_id', function (req, res, next) {
  let event_id = req.params.event_id;

  // Find matching event in the data (a real database will be easier to query)
  let event = events_data.find(function (evt) { return evt.event_id == event_id });

  // alternatively, with standard loops:
  // let event;
  // for(int i = 0; i < events_data.length; i++) {
  //   if (events_data[i].event_id === event_id)
  //     event = events_data[i];
  // }

  if (event === undefined) {
    next(); //pass along to other handlers (send 404)
  }
  else {
    res.render('event_detail', { title: event.event_name, styles: ["tables", "event"], event: event });
  }
});


/* GET event creation form page. */
router.get('/create', function (req, res, next) {
  res.render('event_form', { title: 'Create New Event', style: "newevent" })
});


/* GET event modification form page. */
router.get('/:event_id/modify', function (req, res, next) {
  let event_id = req.params.event_id;

  // Find matching event in the data (a real database will be easier to query)
  let event = events_data.find(function (evt) { return evt.event_id == event_id });

  if (event === undefined) {
    next(); //pass along, send 404
  }
  else {
    res.render('event_form', { title: 'Modify Event', style: "newevent", event: event });
  }

})

/* Convenience function to get the next available event_id; temporary until a real database can manage this part*/
function getNextEventId(){
  return events_data.reduce(function(max_id, event) {return Math.max(max_id, event.event_id);} , 0) + 1;
}

/* POST event; handling form submission for CREATEing a new event . */
router.post('/', function(req, res, next) {
  // TODO: Ultimately, this would be inserted into the actual database.  
  //       For now, we just update the dummmy data in memory (poorly)

  //Get posted form data 
  let new_event_data = req.body;
  // determine new event id
  new_event_data.event_id = getNextEventId();
  // The form's event_date field is in the wrong format and event_ymd is not yet a thing. 
  // We'll let it slide for now.

  //Add to "database" -
  events_data.push(new_event_data);

  //Redirect to the event page for the new event.
  res.redirect(`/events/${new_event_data.event_id}`);
});
  

/* POST event with event_id; handling form submission for MODIFYing an existing event. */
router.post('/:event_id', function(req, res, next) {
  let event_id = req.params.event_id;
  //Confirm event exists.
  let event_index = events_data.findIndex( obj => obj.event_id == event_id);
  if (event_index == -1)
    next(); //send 404
  else {
    //Prepare form data to be added to database
    let updated_event_data = req.body;
    updated_event_data.event_id = event_id;
    // The form's event_date field is in the wrong format and event_ymd is not yet a thing. 
    // We'll let it slide for now.

    //Update and write to database
    events_data[event_index] = updated_event_data;
    
    //Response code of 200 OK
    res.status(200);
    //Redirect to the event page for the updated event.
    res.redirect(`/events/${event_id}`);
  }
});

/* DELETE event with event_id; handling deleting a given event with event_id. */
router.delete('/:event_id', function(req, res, next) {
  let event_id = req.params.event_id;

  //Confirm event exists.
  let event_index = events_data.findIndex( obj => obj.event_id == event_id);
  if (event_index == -1)
    next(); //send 404
  else {
    //Update (delete one element at event_index)
    events_data.splice(event_index, 1);

    //Response code of 204 No Content 
    res.sendStatus(204);

    //Since DELETE is usually sent via AJAX, the browser is not expecting a 
    //response with any new pages.
    //One possible approach is to respond with a suggested URL to go to.
    //Either way, it's the browser's responsibility to handle redirecting as appropriate.
  }
});

