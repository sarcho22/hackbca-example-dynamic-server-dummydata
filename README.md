# hackathon-example-dynamic-render-with-dummy-data

In this step, we begin to upgrade our static prototype webapp to a server-side-rendered (SSR) one, which serves HTML pages dynamically generated from data - ultimately, data that should be sourced from a database. For now, the pages will be rendered from static JSON files, merely simulating an external database source. 

A MySQL database will be integrated properly in the next example; many other kinds of databases could be utilized instead.

Here, we will use the templating engine Handlebars to render the HTML, but that is also easily swapped out if another is preferred.


Note: If you are planning on using a framework like Vue or React, you should use a different setup process, and your architecture will look very different. You should research those setup processes instead if applicable.


## Getting started with express-generator [commit: "express-generator + first steps"]

There is a lot going on in this first commit; let's break down where all this comes from. 

***It is recommended that you go through the process of re-creating this first commit, rather than simply looking through it.*** 

Although we wrote some basic servers already, we're going to start over from scratch. Most server-side rendered express projects have a standard "skeleton structure" that spans over multiple files and folders. 

A skeleton can be quickly made with express-generator tool. You can use the npx command to run it: 

> `npx express-generator --view=hbs <optional-app-name>`

Omit the optional-app-name to build the skeleton using the current folder as the root directory.

Also note the `--view=hbs` option, which configures the app to use the `hbs` module for Handlebars-powered templating. express-generator supports several alternative templating options (e.g. Pug, EJS, etc.). 


The generated file structure should look something like this:

```
.
├── app.js
├── bin
│   └── www
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes
│   ├── index.js
│   └── users.js
└── views
    ├── error.hbs
    ├── index.hbs
    └── layout.hbs
```

### The generated files
The newly generated project structure is a bit complicated, so let’s take a minute to overview it.

- `app.js` – defines the server, including universal middleware like the morgan logger and express.static, but running it doesn’t actually start the server; `node app.js` does nothing
- `bin/www` is the new “entry” point for our server. Notice the "require" of `app.js` to import the main server functionality; the actual "listen to a port" step happens here.
- `public` folder contains all static resources like css & images.
- `routes/index.js` and `routes/users.js` define “routers” to actually handle the webapp’s HTTP routes (e.g. ‘GET /’, ‘GET /users’).
  - Multiple files allow for better organization of subsections of our webapp. 
  - `app.js` acts as the “glue” between the various routers.
- `views` folder contains Handlebars files like `index.hbs`, etc. These are the HTML templates, which are then filled in with data by the server when rendered and served.


#### package.json
One very important file to (mostly) understand is `package.json`, which acts as a sort of “settings” file for Node projects. It does a couple of particularly essential things:

  1) Lists all the project's dependencies: any modules (and their specific versions) that must be installed for the project. 
        - Every use of `npm install <module>` updates `package.json` to include the new module and its version.
        - This allows for efficient migration/version control of the project; as long as the package.json is maintained, the dependencies do not need to be transferred or saved to version control. 
        - Running `npm install` automatically installs the correct version of all listed dependencies. This is usually the first step after cloning a node project. 
        

  2) Defines npm ‘scripts’, including `npm start`, the traditional "launcher" of the app server.
        - By default, the command `npm start` is set to simply run `node bin/www`. 
        - You can easily update and add more custom commands.


### First steps after express-generator

After setting up the skeleton, here are a few recommended first steps to take before diving in.

1.  Install local libraries listed in package.json
    
    > `npm install`

    Note the new `node_modules` folder that appears.

2. Try running the server with this command:
    
    > `npm start`

    Using your browser (or `curl`/Postman) go to `localhost:3000` and `localhost:3000/users` to confirm that the server is correctly serving its default pages.


3. Initialize a git repository for your project. In VSCode, you can use the big blue “Initialize repository” button under the Source Control menu bar. Or, use `git init` in the terminal.

    *Don’t commit anything yet* - there's an the astronomical number of new files in `node_modules`

4. Create a file called `.gitignore` in the root directory. This allows use to specify folders and files to NOT track with git.

    Add a line to it that says `node_modules`, and notice that the number of untracked files shrinks to about 12. 
    
    Stage and commit them with the VSCode Source Control, or `git add *` and `git commit -m "express-generator initial"`

5. Install `nodemon` with npm, but *only as a development dependency*.

> `npm install --save-dev nodemon`

This should automatically update `package.json`.

Then, manually update the "scripts" section of `package.json` to include `"devstart": "nodemon ./bin/www"`.
 

```
{
  ...
  ,
  "scripts": {
    "start": "node ./bin/www",
    "devstart": "nodemon ./bin/www"
  },
  ...
}
```

#### Using nodemon

We frequently find ourselves needing to restart the server whenever files are changed.

`nodemon` is like the `node` command, but it auto-restarts whenever it detects changes to any project files.

This is only useful when actively developing, so we only installed it as a “development” dependency, and it is recorded separately from other dependcies in package.json

Going forward, you can locally run and test your server using the added custom "devstart" script we added to `package.json`:

> `npm run devstart`

which, as it says in `package.json`, just runs `nodemon ./bin/www`. Now, you don't need to manually restart your server as you edit project files.


### Some more reading about the skeleton 

These tutorials also do a good job of explaining getting started with express and the skeleton produced by the express-generator. I recommend skimming the first link, and referencing the second for more detail.

https://www.sitepoint.com/create-new-express-js-apps-with-express-generator/

https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/skeleton_website

### SSR and Handlebars Templating

Simple websites have URLs that simply refer to "static" pages, which show the same information at all times for all users.  However, most webapps show different versions of the same page, depending on the web app data, generated by the server for each request. This technique is known as Server Side Rendering, or SSR. These pages are usually generated with the help of "templates" - a mix of static HTML content and special syntax that specify how and where data can be injected. 

There are many kinds of templating languages, of which express natively supports a large number of them (). Handlebars is one such language, characterized by its "mustache" syntax.

#### Understanding Handlebars in the skeleton app

Take a look at the files in the `views` folder. The `layout.hbs` file contains common HTML used for all of the app's pages; the `{{{ body }}}` indicates where the page-specific templates are inserted. The `index.hbs` and `error.hbs` files are sample templates for the home and error pages, respectively; along with HTML tags, you'll see several double brackets that indicate places for data to be injected. 

The injected data is specified by the parts of the server in the `routes` folder. Notice this code in the `routes/index.js`:

```
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
```

This specifies that for HTTP requests for the URL path '/' - the website's homepage - the server should respond with a rendered page from the `index.hbs` template, using data from the provided "context" object passed as the second parameter. Notice the object has a property called "title", which is referred to in the `layout.hbs` and `index.hbs` template files; when rendered, those bracket expressions are replaced with the "title" property's value, 'Express'. 

There are many more powerful things that can be done with Handlebars templates, which will be explored in the next steps; to start, it is worth skimming this brief tutorial: https://tutorialzine.com/2015/01/learn-handlebars-in-10-minutes

Also, the official website for Handlebars has some documentation which is terse but fairly useful as reference:  https://handlebarsjs.com/guide/