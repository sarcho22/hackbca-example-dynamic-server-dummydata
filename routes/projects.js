var express = require('express');
var router = express.Router();
module.exports = router; //This line is sometimes placed at the bottom, but it doesn't really matter.

// Import dummy projects data 
//TODO: In the future, instead of maintaining the data in server memory, a separate database
//      will be maintained and queried 
var projects_data = require('../data/dummy_projects');

/* GET main projects page. */
router.get('/', function (req, res, next) {
  // Read sort and filter query params if they exist
  var sort = req.query.sort || "Date / Time";
  var filter = req.query.filter || "None";
  //TODO: In the future, actually filter or sort the projects data based on query params
  //      A real database will make that easy

  res.render('projects', { title: 'projects', 
                        style: "tables", 
                        projects: projects_data, 
                        sort: sort,
                        filter: filter});
});

/* GET detailed project page */
router.get('/:project_id', function (req, res, next) {
  let project_id = req.params.project_id;

  // Find matching project in the data (a real database will be easier to query)
  let project = projects_data.find(function (evt) { return evt.project_id == project_id });

  // alternatively, with standard loops:
  // let project;
  // for(int i = 0; i < projects_data.length; i++) {
  //   if (projects_data[i].project_id === project_id)
  //     project = projects_data[i];
  // }

  if (project === undefined) {
    next(); //pass along to other handlers (send 404)
  }
  else {
    res.render('project_detail', { title: project.project_name, styles: ["tables", "project"], project: project });
  }
});


/* GET project creation form page. */
router.get('/create', function (req, res, next) {
  res.render('project_form', { title: 'Create New project', style: "newproject" })
});


/* GET project modification form page. */
router.get('/:project_id/modify', function (req, res, next) {
  let project_id = req.params.project_id;

  // Find matching project in the data (a real database will be easier to query)
  let project = projects_data.find(function (evt) { return evt.project_id == project_id });

  if (project === undefined) {
    next(); //pass along, send 404
  }
  else {
    res.render('project_form', { title: 'Modify project', style: "newproject", project: project });
  }

})

/* Convenience function to get the next available project_id; temporary until a real database can manage this part*/
function getNextprojectId(){
  return projects_data.reduce(function(max_id, project) {return Math.max(max_id, project.project_id);} , 0) + 1;
}

/* POST project; handling form submission for CREATEing a new project . */
router.post('/', function(req, res, next) {
  // TODO: Ultimately, this would be inserted into the actual database.  
  //       For now, we just update the dummmy data in memory (poorly)

  //Get posted form data 
  let new_project_data = req.body;
  // determine new project id
  new_project_data.project_id = getNextprojectId();
  // The form's project_date field is in the wrong format and project_ymd is not yet a thing. 
  // We'll let it slide for now.

  //Add to "database" -
  projects_data.push(new_project_data);

  //Redirect to the project page for the new project.
  res.redirect(`/projects/${new_project_data.project_id}`);
});
  

/* POST project with project_id; handling form submission for MODIFYing an existing project. */
router.post('/:project_id', function(req, res, next) {
  let project_id = req.params.project_id;
  //Confirm project exists.
  let project_index = projects_data.findIndex( obj => obj.project_id == project_id);
  if (project_index == -1)
    next(); //send 404
  else {
    //Prepare form data to be added to database
    let updated_project_data = req.body;
    updated_project_data.project_id = project_id;
    // The form's project_date field is in the wrong format and project_ymd is not yet a thing. 
    // We'll let it slide for now.

    //Update and write to database
    projects_data[project_index] = updated_project_data;
    
    //Response code of 200 OK
    res.status(200);
    //Redirect to the project page for the updated project.
    res.redirect(`/projects/${project_id}`);
  }
});

/* DELETE project with project_id; handling deleting a given project with project_id. */
router.delete('/:project_id', function(req, res, next) {
  let project_id = req.params.project_id;

  //Confirm project exists.
  let project_index = projects_data.findIndex( obj => obj.project_id == project_id);
  if (project_index == -1)
    next(); //send 404
  else {
    //Update (delete one element at project_index)
    projects_data.splice(project_index, 1);

    //Response code of 204 No Content 
    res.sendStatus(204);

    //Since DELETE is usually sent via AJAX, the browser is not expecting a 
    //response with any new pages.
    //One possible approach is to respond with a suggested URL to go to.
    //Either way, it's the browser's responsibility to handle redirecting as appropriate.
  }
});

