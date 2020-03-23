const db = require("./db.js");

let orm = {
  viewtaEmployee: function(tableInput) {
    const queryString = `SELECT first_name, last_name,title,dep_name FROM employees AS emp
    INNER JOIN role ON emp.roleID = role.roleID
    LEFT JOIN department
    ON role.depID = department.id `;
    db.query(queryString, [tableInput], function(err, result) {
      if (err) throw err;
      // console.log(result);
      console.table(result);
    });
  },

  addEmployee: async function(firstname, lastname, roleID, maganerID) {
    const queryString =
      "INSERT INTO employees (first_name, last_name, roleID, maganerID ) VALUES(?, ?, ?,?);";
    await db.query(
      queryString,
      [firstname, lastname, roleID, maganerID],
      function(err, result) {
        if (err) throw err;

        return result;
      }
    );
  },
  addDepartmnet: async function(depname) {
    const queryString = "INSERT INTO department (dep_name ) VALUES(? );";
    await db.query(queryString, [depname], function(err, result) {
      if (err) throw err;

      return result;
    });
  },
  addRole: async function(title, salary) {
    const queryString = "INSERT INTO department (title,salary ) VALUES(?,? );";
    await db.query(queryString, [title, salary], function(err, result) {
      if (err) throw err;

      return result;
    });
  },

  changeEmployee: function() {},
  viewtable: function(tableInput) {
    const queryString = "SELECT * FROM ?? ";
    db.query(queryString, [tableInput], function(err, result) {
      if (err) throw err;
      console.table(result);
    });
  },
  selectWhere: function(tableInput, colToSearch, valOfCol, callback) {
    const queryString = "SELECT * FROM ?? WHERE ?? = ?";
    db.query(queryString, [tableInput, colToSearch, valOfCol], function(
      err,
      result
    ) {
      if (err) throw err;
      return callback(result);
    });
  },

  findWhoHasMost: function(
    tableOneCol,
    tableTwoForeignKey,
    tableOne,
    tableTwo
  ) {
    const queryString =
      "SELECT ??, COUNT(??) AS count FROM ?? LEFT JOIN ?? ON ??.??= ??.id GROUP BY ?? ORDER BY count DESC LIMIT 1";

    db.query(
      queryString,
      [
        tableOneCol,
        tableOneCol,
        tableOne,
        tableTwo,
        tableTwo,
        tableTwoForeignKey,
        tableOne,
        tableOneCol
      ],
      function(err, result) {
        if (err) throw err;
        return result;
      }
    );
  }
}; //end of orm
module.exports = orm;
