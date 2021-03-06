//initial setup

const express = require('express');
const menusRouter = express.Router();

//database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//router import
const menuItemsRouter = require('./menu-items');

//parameters
menusRouter.param('menuId', (req, res, next, menuId) => {

  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};

  db.get(sql, values, (error, menu) => {

    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }

  });

});

//subrouterlink
menusRouter.use('/:menuId/menu-items', menuItemsRouter);

//routes
// /api/menus
menusRouter.get('/', (req, res, next) => {

  db.all('SELECT * FROM Menu', (err, menus) => {

      if (err) {
        next(err);
      } else {
        res.status(200).json({menus: menus});
      }

    });

});

menusRouter.post('/', (req, res, next) => {

  const title = req.body.menu.title;

  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title)' +
      'VALUES ($title)';
  const values = {
    $title: title
  };

  db.run(sql, values, function(error) {

    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          res.status(201).json({menu: menu});
        });
    }

  });

});

// /api/menus/:menuId
menusRouter.get('/:menuId', (req, res, next) => {

  res.status(200).json({menu: req.menu});

});

menusRouter.put('/:menuId', (req, res, next) => {

  const title = req.body.menu.title;

  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET title = $title ' +
      'WHERE Menu.id = $menuId';
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };

  db.run(sql, values, (error) => {

    if (error) {
      next(error);
    } else {

      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error, menu) => {
        res.status(200).json({menu: menu});
      });

    }

  });

});

menusRouter.delete('/:menuId', (req, res, next) => {

  const menuItemSql = 'SELECT * from MenuItem WHERE MenuItem.menu_id = $menuId';
  const menuItemValues = {$menuId: req.params.menuId};

  db.get(menuItemSql, menuItemValues, (error, menuItems) => {

    if (menuItems) {
      res.sendStatus(400);
    } else {

      const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
      const values = {$menuId: req.params.menuId};

      db.run(sql, values, (error) => {

        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }

      });

    };

  })

});

module.exports = menusRouter;


/*
/api/menus**
- GET
  - Returns a 200 response containing all saved menus on the `menus` property of the response body
- POST
  - Creates a new menu with the information from the `menu` property of the request body and saves it to the database. Returns a 201 response with the newly-created menu on the `menu` property of the response body
  - If any required fields are missing, returns a 400 response

/api/menus/:menuId**
- GET
  - Returns a 200 response containing the menu with the supplied menu ID on the `menu` property of the response body
  - If a menu with the supplied menu ID doesn't exist, returns a 404 response
- PUT
  - Updates the menu with the specified menu ID using the information from the `menu` property of the request body and saves it to the database. Returns a 200 response with the updated menu on the `menu` property of the response body
  - If any required fields are missing, returns a 400 response
  - If a menu with the supplied menu ID doesn't exist, returns a 404 response
- DELETE
  - Deletes the menu with the supplied menu ID from the database if that menu has no related menu items. Returns a 204 response.
  - If the menu with the supplied menu ID has related menu items, returns a 400 response.
  - If a menu with the supplied menu ID doesn't exist, returns a 404 response
*/
