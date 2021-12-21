# hackathon-example-dynamic-render-with-dummy-data

You should have already learned how to build a skeleton app with  `express-generator` (
https://github.com/atcs-wang/hackbca-example-dynamic-server-start)


Next, we begin to translate our prototypes into an SSR app. This requires us to write both page templates and data that drives the page content.

Ultimately, a webapp's data should be stored in and managed by a proper database server - the so-called "data layer." For now, just so we can see our pages begin to come to life with templating, we will merely keep our data as Javascript objects in the express web server. **This is NOT a viable long-term solution, as such data is not persistent - any changes to the data will be lost if the server is interrupted and stops running.**

We will also discuss the role of other HTTP methods, like POST and DELETE, although their potential will be limited until the persistent data layer 

## The "dummy" event data: data/dummy_events.js

Check out `data/dummy_events.js`. The file defines one large array of objects, each with properties representing information about an event. This is the actual format which data coming from an SQL database would be structured as - a series (array) of rows (objects) with columns (object properties)

For now, we'll utilize this array as if it was just sourced from a database.

The array is assigned to `module.exports`, which allows other files in the Node project to "import" it via

```js
var events_data = require('<relative/path/to>/dummy_events.js');
```

This data will be used provide context for page templates.

## Copying static resources from our prototypes

Before we begin to translate our prototypes into templates, we can first copy all of the static resources into our public folder - including CSS, front-end JS, and images.

Here are the folders and files in the public folder after copying contents:

```
public
├───images
│       assembly.jpg (later renamed to Auditorium.jpg)
│       bca-logo-transparent.png
│       favicon.ico
│       phoenix.png
│
├───js
│       event_utils.js (edited later)
│       materialize.min.js
│
└───styles
        event.css
        index.css
        main.css
        materialize.min.css
        newevent.css
        tables.css
```
You may have additional static resources from your additional prototypes.

As noted above, some of these files are renamed/edited from their prototype versions. There are more .jpg images added later as well.
## First templates and partials: layout.hbs, header.hbs, footer.hbs (app.js)

The basics of Handlebars templating was explained in the previous commit with the generated skeleton. 

For our example webapp, all our pages share many of the same elements. These elements can be included in the `layout.hbs` file; every page of the website uses the same favicon, Materialize CSS and JS, Google Font Materialize Icons, and main.css styles, just to name a few. 

Some of the elements, obviously, differ page to page. The `{{{body}}}` indicates where the page-specific template will be injected. Other page-specific data contexts will be injected at other points; the `{{title}}` can be specified, and also one or more optional stylesheet names; the `if` and `each` Handlebars blocks help manage those.

This `layout.hbs` goes further and utilizes another Handlebars technique known as "partials", which allows us to compose templates from smaller template parts; the `footer.hbs` and `header.hbs` files in the `views/partials` subfolder contain the respective HTML for each part, and are included via the `{{>partial}}` syntax in `layout.hbs`

Notice that links in `header.hbs` uses different URLs than the prototypes did - instead of implying a static `.html` file, the URL paths do not specify a file extension, but a more general "section" of the website. 

To register the partials in the `views/partial` subfolder, these lines must be added to `app.js`:

```js
  //Additional setup with the hbs view engine
  var hbs = require('hbs');
  //Register partials in particular directory
  hbs.registerPartials(__dirname + '/views/partials', function (err) {;});
```

With the layout all set up, now we can look at how each of our page prototypes are translated into rendered templates for each page.
## The homepage (index.hbs, routes/index.js)

The main content of the hompage is found in the `index.hbs` file. Its mostly static, but there are a few 
bits of data context (`num_events, num_attendees, num_projects`) that can now be injected. For now, we will inject the `num_events` but not the other two.

Look at the updated router for the homepage in `routes/index.js` is updated, and note the new line:

```js
var events_data = require('../data/dummy_events');
```

This "imports" the dummy data, and the length of the data is passed as the `num_events` property in the context object passed to `res.render`. Also passed in the context object are the page title and `index.css` stylesheet.

Start the server with

```
npm run devstart
```

and visit `localhost:3000` to see the homepage. It should look like your prototype, but now the "See What's Happening" button now includes the number "18". 

The link to the events page, of course, results in a 404. Let's build that page and the rest of the event-related pages next!

## The Events router (routes/events.js, app.js)

The remaining prototypes all have to do with the "events" portion of the website. It would be natural for all pages 
related to events to be found under the (sub)path `/events`, and for the handling of all such pages to be grouped together in the server.

To accomplish this, the new file `routes/events.js` is added, similar to `routes/index.js`. Note the first 3 lines which create an exported Router:

```js
var express = require('express');
var router = express.Router();
module.exports = router;
```

 Note these two new lines in `app.js`, which "import" that Router and attach it to the express app as a sub-router for all URL paths beginning with "/events":

```js
var eventsRouter = require('./routes/events');
```

```js
app.use('/events', eventsRouter);
```

Like the router created in `routes/index.js`, the rest of `routes/events.js` sets up handlers for various URL sub-paths that come after "/events". Each route utilizes the events data to render pages from templates. Note this line that imports the dummy event data:

```js
var events_data = require('../data/dummy_events');
```

Let's break down how each page is rendered, and the templates involved:

### The main /events page (views/events.hbs)

The main events list page is designated for the '/' sub-route (which is the '/events' URL). 

The main content of the events list page is found in `events.hbs`, which is rendered with `events_data` as part of the data context. The template uses an `{{#each events_data}}` to iterate over the array and create a table row for each object in it.
#### A brief note: URL-embedded query parameters
You'll notice that many of the links on the events page link back to the same page, but with something appended to the URL like "?sort=location" or "?filter=type:Main". These are optional parts of a URL called query parameters, and are often used to request more specific options for the page being rendered. 

For now, they are only regurgitated into the page as written, but we could (and eventually will once the database is integrated) actually filter or sort the data before rendering the page with it. 

### The detailed /event/:event_id pages; URL parameters (views/event_detail.hbs)

In our prototypes, specific events each had a page with details for it, but each page looks very similar. Its really just different versions of one page, but with different data for different events. So we'll use one template (`views/event_detail.hbs`) for all of these pages, but differ the event data for each page, based on the different URLs.

Since each event in the data has a unique `event_id`, we assign a unique URL based on that: all URLS of the pattern "/event/`event_id`". The Express route can identify URLs of that pattern and capture the `event_id` from the URL structure. Then, the handler finds the matching `event` object in the `events_data` and use it as data context for rendering the template. Thus - one page template, but separate URLS and rendered pages for each event in the data.

Of note: there are new images in the `public/images` folder which match each possible `event_location`, allowing for each page to use an image that matches the location of the event.

### The /event/create and /event/:event_id/modify pages; (views/event_form.hbs); 

The template for both the event creation page and event modification page(s) is in `views/event_form.hbs`; it includes a form for the client to enter or change data for an event.

The "create" page is simply the empty form, but the modify page(s) are similar to the event detail pages: based on the `event_id` in the URL, rendered from the same template with the appropriate `event` object from the `events_data`. Note the use of the built-in Handlebars helpers `#if` and `#unless` - if the `event` context is provided or not dictates whether the template turns into a "Create" page (where the form's fields are empty) or a "Modify" page, where the form's fields are initialized to the current `event` data.  

But what are forms for anyways? Forms are one of the chief ways website/webapp users can send information to the server via HTTP POST requests. Let's explain forms and POST briefly.
#### HTML Forms and HTTP POST requests 

Typical web browsing is all about HTTP GET requests - when you enter a URL in your browser, it sends an HTTP GET request to the server associated with the domain for a resource associated with the URL path. The server sends a response with a "body" - the resource that was requested, which is usually some kind of HTML webpage or part of a webpage (like a stylesheet or image or external JS file).  

This client-asks-server-provides pattern is sufficient up to the point where a user wants to upload data to the server - say, sending your email address to sign up for a newsletter, or changing your password, or uploading a social media post. Usually, this information is entered into some kind of **HTML form** on a webpage. Submitting the form will then send an HTTP POST request to the server., which is like a HTTP GET request except it also includes a "body" that contains the data in the form. The server listens for POST requests like it does GET requests, but the server can then use the uploaded data in the body to do something like update their database. 

The HTML form in `views/event_forms.hbs` is configured in the opening `<form>` tag to send a POST request to either the `/events` URL (if creating a new event) or `/events/{{event.event_id}}` for the event being modified. 

Take a look at the two `router.post(...` bits in the `routes/events.js` file. These are listening for POST requests to those respective URLs. In each, `req.body` is a JS object that represents the uploaded data in the body of the request; each property name-value pair matches a field from the HTML form. (This is made possible by the `express.json()` middleware in `app.js`).

For now, our POST handlers simply (and somewhat ham-fisted-ly) add or replace an event in `events_data` with the `req.body` - simulating a database update. Afterwards, the main `/events` page has a new/updated table row, and there is a new/updated event detail page. (There are some missing bits of info not provided from the forms, but we'll let them slide for now).

A POST request is typically responded to with a new page like a GET request does. A common technique is to render or redirect to a page where the uploaded data can be seen. In this case, we already have GET request handlers for event detail pages, so we redirect the user to the page matching the created/modify event.

 (Of course, this all vanishes once the server restarts - hold on for the persistent database layer integration!)  

### The "delete" buttons (public/js/event_utils.js)

On both the main events and event detail pages are "delete" buttons, which in the prototypes have only shown "dummy" confirmation prompts. Now, we want the browser to actually communicate with the server when they are clicked.

Similar to how forms send POST requests, these buttons can be configured to send an HTTP DELETE request to the server - indicating that a particular event should be deleted. 

The file `public/js/event_utils.js` contains a function called `confirmDelete` that is triggered by the delete buttons. It has been updated since the prototypes (where it just showed two pointless confirm popups) to use the `fetch` method. `fetch` uses a technique called "Asynchronous Javascript And XML"  (AJAX for short), which sends an HTTP request to a URL, but **without** going to a new page.  (`fetch` uses Promise syntax instead of callbacks, which may be new to you and is worth learning about). In this case,   `fetch` is used to send a DELETE request to the URL that corresponds with a given event's id.

The `router.delete(...` handler in the `routes/events.js` listens for these requests, and updates the "database" appropriately before sending back a success code but with no content. 

Upon reception of the success code, the `confirmDelete` function redirects itself to the `/events` page where the user can see that the event in question is no longer present - similar to how a successful POST results in a redirect to the new/updated resource.

#### Alternative approaches for DELETE
Since an HTTP DELETE request doesn't typically require a body, it is conceptually very similar to a GET request. An alternative approach to using fetch/AJAX is to simply make the delete buttons links to URLs that represent the action of deleting a page; the deletion action would then be registered under a matching GET listener in the router.

However, it is considered better practice to utilize DELETE where it seems appropriate, and to keep GET requests limited to actual requests for *resources.*  

## Your turn to practice:

If you have additional prototypes and static resources that you already built for the projects pages (from "Your turn to practice" of https://github.com/atcs-wang/hackbca-example-prototypes ), you may want to port them to this project.

Similar to our current "events" section of the webapp, implement the "projects" section of the webapp. Here's a breakdown of the parts:

1) Create some dummy data for the projects called `dummy_projects.js`, similar to `data/dummy_events.js`. Place your dummy data into the `data` folder.


2) Create Handlebars templates for each of the project pages (basing them on your prototypes, if you have them):

    -  `projects.hbs` - table/list  of all projects; links to project detail , modify and create pages, and "dummy" delete button
    -  `project_detail.hbs` - detail page for one project; links to modify page, and "dummy" delete button
    -  `project_form.hbs` - form for creating/modifying projects

You may also need to update or add static resources like CSS or JS files.

3) Add a new Router "projects.js", similar to routes/events.js, to the routes folder, and integrate it into app.js so it handles URLs beginning with "/projects". It should utilize the dummy projects data.

    a) Add GET route handlers for
    - `/` - shows the project table/list
    - `/:id` - shows detail page for project with given id
    - `/create` - shows form for creating projects
    - `/:id/modify` - shows form for modifying project with given id, prepopulate with current data

    b) Add POST route handlers for 
    - `/` - handles creating a new project from form data
    - `/:id/modify` - handles modifying an existing project with given id from form data

    c) Add a DELETE route handler for
    - `/:id` - handles deleting project with given id



