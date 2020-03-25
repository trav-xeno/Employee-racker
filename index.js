const orm = require("./orm.js");
const inq = require("inquirer");
const chalk = require("chalk");
const mysql = require("mysql");
/*

function getLastRecord(name)
{
    return new Promise(function(resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err) on catch.
        var connection = getMySQL_connection();

        var query_str =
        "SELECT name, " +
        "FROM records " +
        "WHERE (name = ?) " +
        "LIMIT 1 ";

        var query_var = [name];

        connection.query(query_str, query_var, function (err, rows, fields) {
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });

*/

const db = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Ac3X3n0Pil0t.923",
  database: "employee"
});
db.connect(function(err) {
  if (err) throw err;
  //console.log("connected as id " + connection.threadId);
  start();
});

const viewEmployee = () => {
  const queryString = `SELECT concat(emp.first_name, ' ', emp.last_name) AS full_name, concat(supervisor.first_name, ' ', supervisor.last_name) AS manager, title AS role, dep_name AS department FROM employees AS emp
  inner JOIN role ON emp.roleID = role.roleID
  LEFT JOIN department
  ON role.depID = department.id
  LEFT JOIN employees AS supervisor ON(emp.managerID = supervisor.employeeID); 
`;
  db.query(queryString, function(err, result) {
    if (err) throw err;
    // console.log(result);
    console.table(result);
    start();
  });
};

//---------------------------------------

const dbAddEmployee = (firstname, lastname, roleID, managerID) => {
  db.query(
    "INSERT INTO employees SET ?",
    {
      first_name: firstname,
      last_name: lastname,
      roleID: roleID,
      managerID: managerID
    },
    function(err) {
      if (err) throw err;

      console.log(
        chalk.greenBright(
          `${firstname} ${lastname} has been successfully added!`
        )
      );

      start();
    }
  );
};
const dbAddDepartmnet = depname => {
  const queryString = "INSERT INTO department (dep_name ) VALUES(? );";
  db.query(queryString, [depname], function(err, result) {
    if (err) throw err;
    console.log(chalk.greenBright(`${depname} was successfully added!`));
    start();
  });
};
const dbAddRole = (title, salary, depID) => {
  db.query(
    "INSERT INTO role SET ?",
    {
      title: title,
      salary: salary,
      depID: depID
    },
    function(err) {
      if (err) throw err;

      console.log(
        chalk.greenBright(`This Role: ${title} salary: ${salary} added!`)
      );

      start();
    }
  );
};
const viewRole = () => {
  const query = `SELECT title, salary , dep.dep_name AS departments FROM role 
  LEFT JOIN department as dep ON role.depID = dep.id`;
  db.query(query, function(err, result) {
    if (err) throw err;
    console.table(result);
    start();
  });
};
const viewDepartment = () => {
  const queryString = "SELECT dep_name AS departments FROM department ";
  db.query(queryString, function(err, result) {
    if (err) throw err;
    console.table(result);
    start();
  });
};

const selectWhere = (tableInput, colToSearch, valOfCol, callback) => {
  const queryString = "SELECT * FROM ?? WHERE ?? = ?";
  db.query(queryString, [tableInput, colToSearch, valOfCol], function(
    err,
    result
  ) {
    if (err) throw err;
    return callback(result);
  });
};

const addDepartment = () => {
  inq
    .prompt([
      {
        type: "input",
        name: "depname",
        message: chalk.magenta("What is the department name?"),
        validate: function(length) {
          if (length === "") {
            return "This can" + chalk.red("NOT be empty");
          }
          return true;
        }
      }
    ])
    .then(function(answer) {
      dbAddDepartmnet(answer.depname);
    });
};
const addRole = () => {
  db.query("SELECT * FROM department", function(err, depRows) {
    if (err) throw err;
    inq
      .prompt([
        {
          type: "input",
          name: "title",
          message: chalk.magenta("What is the name of the role?"),
          validate: function(length) {
            if (length === "") {
              return "This can" + chalk.red("NOT be empty");
            }
            return true;
          }
        },
        {
          type: "input",
          name: "salary",
          message: chalk.magenta("What is the salary?"),
          validate: function(salary) {
            if (salary === "") {
              return "This can" + chalk.red("NOT be empty");
            } else if (isNaN(salary)) {
              return "This " + chalk.red("MUST be a number!");
            } else {
              return true;
            }
          }
        },
        {
          name: "depID",
          type: "list",
          message: chalk.magenta("What is the department?"),
          choices: function() {
            let deps = [];
            depRows.forEach(el => deps.push(el.dep_name));
            return deps;
          }
        }
      ])
      .then(function(answer) {
        db.query(
          "SELECT id FROM department WHERE dep_name = ?",
          answer.depID,
          function(err, res) {
            if (err) throw err;
            dbAddRole(answer.title, answer.salary, res[0].id);
          }
        );
      });
  });
};

//------------------------------
// this sucked majorly only way I could confirm that  everything had access to db results ...
// would have done promises which was the first time but brut forcing it to work and turn  in
const addEmployee = () => {
  db.query("SELECT * FROM role", function(err, roleRows) {
    if (err) throw err;

    db.query(
      "SELECT concat(first_name, ' ', last_name) AS full_name FROM employees",
      function(err, employRows) {
        if (err) throw err;

        inq
          .prompt([
            {
              name: "firstname",
              type: "input",
              message: chalk.magenta("What is the first name?"),
              validate: function(firstname) {
                if (firstname === "") {
                  return "This can" + chalk.red("NOT be empty");
                }
                return true;
              }
            },
            {
              name: "lastname",
              type: "input",
              message: chalk.magenta("What is the last name? "),
              validate: function(lastname) {
                if (lastname === "") {
                  return "This can" + chalk.red("NOT be empty");
                }
                return true;
              }
            },
            {
              name: "role",
              type: "list",
              message: chalk.magenta("What is the employee's role?"),
              choices: function() {
                let roles = [];
                roleRows.forEach(el => roles.push(el.title));
                return roles;
              }
            },
            {
              name: "manager",
              type: "list",
              message: chalk.magenta("Who is the employee's manager?"),
              choices: function() {
                let managers = ["None"]; //is better then null should have set it as my defualt value but oh well too late
                employRows.forEach(el => managers.push(el.full_name));
                return managers;
              }
            }
          ])
          .then(function(answer) {
            db.query(
              "SELECT roleID FROM role WHERE title = ?",
              answer.role,
              function(err, roleId) {
                if (err) throw err;

                db.query(
                  "SELECT employeeID FROM employees WHERE concat(first_name, ' ', last_name) = ?",
                  answer.manager,
                  function(err, manId) {
                    if (err) throw err;

                    let managerId;
                    answer.manager === "None"
                      ? (managerId = null)
                      : (managerId = manId[0].id); //<-- see above comment about I hso

                    dbAddEmployee(
                      answer.firstname,
                      answer.lastname,
                      roleId[0].id,
                      managerId
                    );
                  }
                );
              }
            );
          });
      }
    );
  });
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

const removeEmployee = () => {
  db.query(
    "SELECT concat(first_name, ' ', last_name) AS full_name FROM employees",
    function(err, empRows) {
      if (err) throw err;

      inq
        .prompt([
          {
            name: "employee",
            type: "list",
            message: chalk.blueBright("Which employee do you want to delete?"),
            choices: function() {
              let emplist = [];
              empRows.forEach(el => emplist.push(el.full_name));
              return emplist;
            }
          }
        ])
        .then(function(answer) {
          db.query(
            "DELETE FROM employees WHERE concat(first_name, ' ', last_name) = ?",
            answer.employee,
            function(err, res) {
              if (err) throw err;

              console.log(chalk.greenBright(`${answer.employee} was deleted!`));
              start();
            }
          );
        });
    }
  );
};

const add = () => {
  inq
    .prompt({
      name: "action",
      type: "list",
      message: chalk.blue("What would you like to add?"),
      choices: ["department", "role", "employee"]
    })
    .then(function(answer) {
      switch (answer.action) {
        case "employee":
          addEmployee();
          break;
        case "role":
          addRole();
          break;
        case "department":
          addDepartment();
          break;
      }
    });
};

const view = () => {
  inq
    .prompt({
      name: "action",
      type: "list",
      message: chalk.blue("What would you like to view?"),
      choices: ["department", "role", "employee"]
    })
    .then(function(answer) {
      switch (answer.action) {
        case "employee":
          viewEmployee();
          break;
        case "role":
          viewRole();
          break;
        case "department":
          viewDepartment();
          break;
      }
    });
};
const updateRole = () => {
  db.query(
    "SELECT concat(first_name, ' ', last_name) AS full_name FROM employees",
    function(err, empRows) {
      if (err) throw err;

      db.query("SELECT title FROM role", function(err, roleRows) {
        if (err) throw err;

        inq
          .prompt([
            {
              name: "employee",
              type: "list",
              message: chalk.magenta(
                "Which employee would you like to update?"
              ),
              choices: function() {
                let emplist = [];
                empRows.forEach(el => emplist.push(el.full_name));
                return emplist;
              }
            },
            {
              name: "role",
              type: "list",
              message: chalk.magenta("What is the new role?"),
              choices: function() {
                let rolelist = [];
                roleRows.forEach(el => rolelist.push(el.title));
                return rolelist;
              }
            }
          ])
          .then(function(answer) {
            db.query(
              "SELECT roleID FROM role WHERE title = ?",
              answer.role,
              function(err, res) {
                if (err) throw err;

                db.query(
                  "UPDATE employees SET roleID = ? WHERE concat(first_name, ' ', last_name) = ?",
                  [res[0].roleID, answer.employee],
                  function(err) {
                    if (err) throw err;

                    console.log(
                      chalk.greenBright(
                        `${answer.employee}'s role has been updated to ${answer.role}.`
                      )
                    );

                    start();
                  }
                );
              }
            );
          });
      });
    }
  );
};

const start = () => {
  let list = [
    "Add an employee, department, role",
    "View employees, departments, roles",
    "Update employee roles",
    "Delete employee"
  ];
  inq
    .prompt({
      name: "action",
      type: "list",
      message: chalk.greenBright("What would you like to do?"),
      choices: list
    })
    .then(function(answer) {
      switch (answer.action) {
        case "Add an employee, department, role":
          add();
          break;
        case "View employees, departments, roles":
          view();
          break;
        case "Update employee roles":
          updateRole();
          break;
        case "Delete employee":
          removeEmployee();
          break;
        case "View the total utilized budget of a department":
          budget();
          break;
      }
    });
};
