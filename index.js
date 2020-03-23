const orm = require("./orm.js");
const db = require("./db.js");
const inq = require("inquirer");
const chalk = require("chalk");

const addEmployee = async (rolelist, emplist) => {
  let { firstname, lastname } = await getname();
  let { roleID, dep_name } = await getRD(rolelist, emplist);
  let ob = {
    first: firstname,
    last: lastname,
    role: roleID,
    dep: dep_name
  };
  return ob;
};
const getname = () => {
  return inq.prompt([
    {
      type: "input",
      name: "firstname",
      message: "What is the first name?",
      validate: function(length) {
        if (length === "") {
          return "This can" + chalk.red("NOT be empty");
        }
      }
    },
    {
      type: "input",
      name: "lastname",
      message: "What is the lastname?",
      validate: function(length) {
        if (length === "") {
          return "This can" + chalk.red("NOT be empty");
        }
        return tru;
      }
    }
  ]);
};
const getRD = (rolelist, emplist) => {
  return inq.prompt([
    {
      type: "list",
      name: "roleID",
      message: "choose a role ",
      choices: rolelist
    },
    {
      type: "list",
      name: " manager",
      message: "choose a manager ",
      choices: emplist
    }
  ]);
};

const adddepartment = () => {
  return inq.prompt([
    {
      type: "input",
      name: "depname",
      message: "What is the department name?",
      validate: function(length) {
        if (length === "") {
          return "This can" + chalk.red("NOT be empty");
        }
      }
    }
  ]);
};
const addRole = () => {
  return inq.prompt([
    {
      type: "input",
      name: "title",
      message: "What is the name of the role?",
      validate: function(length) {
        if (length === "") {
          return "This can" + chalk.red("NOT be empty");
        }
      }
    },
    {
      type: "input",
      name: "salary",
      message: "What is the salary?",
      validate: function(length) {
        if (length === "") {
          return "This can" + chalk.red("NOT be empty");
        }
      }
    }
  ]);
};
/*
Build a command-line application that at a minimum allows the user to:

Add departments, roles, employees

View departments, roles, employees

Update employee roles

Update employee managers

View employees by manager

Delete departments, roles, and employees


View the total utilized budget of a department -- ie the combined salaries of all employees in that department
*/

const listDepartment = callback => {
  queryString = "SELECT dep_name FROM department";
  db.query(queryString, function(err, result) {
    if (err) throw err;
    let raw = [];
    result.forEach(el => {
      raw.push(el);
    });
    return callback(raw);
  });
};
const listRole = callback => {
  queryString = "SELECT title,salary FROM role ";
  db.query(queryString, function(err, result) {
    if (err) throw err;
    let raw = [];
    result.forEach(el => {
      raw.push(el);
    });
    return callback(raw); // result;
  });
};
const listEmployees = callback => {
  queryString = "SELECT first_name,last_name FROM employees ";
  db.query(queryString, function(err, result) {
    if (err) throw err;
    let raw = [];
    result.forEach(el => {
      raw.push(el);
    });
    return callback(raw); //result;
  });
};
const getList = str => {
  let data = [];
  switch (str) {
    case "employee":
      let employeList = [];
      listEmployees(function(queryResult) {
        // console.lot(queryResult);
        queryResult.forEach(el => {
          employeList.push(`${el.first_name} ${el.last_name}`);
        });
        console.log(employeList);
        return queryResult;
      });
    case "department":
      let deplist = [];
      listDepartment(function(queryResult) {
        queryResult.forEach(el => {
          if (el.dep_name !== "unlabeled") {
            deplist.push(el.dep_name);
          }
        });
        // console.log(deplist);
      });
      return deplist;
      break;
    case "role":
      let rolelist = [];
      listRole(function(queryResult) {
        //return queryResult;
        queryResult.forEach(el => {
          rolelist.push(`${el.title} : ${el.salary}`);
        });
      });
      return rolelist;
  }
};

const todo = () => {
  let list = [
    "view employees",
    "view departments",
    "view roles ",
    "add employee",
    "add department",
    "add role",
    "update employee data",
    "update employee role",
    "update employee manager",
    "delete employee",
    "delete role",
    "delete department"
  ];
  return inq.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: list
    }
  ]);
};
const removeRow = table => {
  switch (table) {
    case "employee":
      break;
    case "role":
      break;
    case "department":
      break;
  }
};
const add = table => {
  switch (table) {
    case "employee":
      let rollist = listRole();
      let emplist = listEmployees();
      let res = addEmployee(rollist, emplist);
      console.log(res);
      break;
    case "role":
      let resRol = addRole();
      console.log(resRol);
      break;
    case "department":
      let resDep = adddepartment();
      console.log(resDep);
      break;
  }
};
const updateRole = () => {};

const start = async () => {
  let { action } = await todo();
  //console.log(getList("employee"));

  switch (action) {
    case "view employees":
      await orm.viewtaEmployee("employees");
      break;
    case "view departments":
      await orm.viewtable("department");
      break;
    case "view roles ":
      await orm.viewtable("role");
      break;
    case "add employee":
      await add("employee");
      break;
    case "add department":
      await add("department");
      break;
    case "add role":
      await add("role");
      break;
    case "update employee":
      break;
    case "delete employee":
      break;
    case "delete role":
      break;
    case "delete department":
      break;
  }
  // console.log(action);
};
start();
