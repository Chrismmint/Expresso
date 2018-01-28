//initial setup

const express = require('express');
const apiRouter = express.Router();

//router import

const employeesRouter = require('./employees');
const menusRouter = require('./menus');

//router links

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);

//router export

module.exports = apiRouter;
