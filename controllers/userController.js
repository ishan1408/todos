const fs = require("fs");
const path = require("path");

const usersFilePath = path.join(__dirname, "../data/users.json");

let users = [];
try {
  const data = fs.readFileSync(usersFilePath, "utf-8");
  users = JSON.parse(data);
} catch (err) {
  console.error("Error reading users file:", err.message);
}

exports.getAllUsers = (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to retrieve users" });
  }
};

exports.createUser = (req, res) => {
  try {
    const newUser = { id: Date.now(), ...req.body };
    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    res.status(201).json({
      status: "success",
      data: newUser,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to create user" });
  }
};

exports.updateUser = (req, res) => {
  try {
    const id = +req.params.id;
    const idx = users.findIndex((u) => u.id === id);

    if (idx === -1) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    users[idx] = { ...users[idx], ...req.body };
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.status(200).json({
      status: "success",
      data: users[idx],
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to update user" });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const id = +req.params.id;
    const userExists = users.some((u) => u.id === id);

    if (!userExists) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    users = users.filter((u) => u.id !== id);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.status(204).json();
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to delete user" });
  }
};
