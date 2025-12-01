import chalk from "chalk";
import inquirer from "inquirer";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const log = console.log;
log(chalk.bgRed.white.bold.underline("⭐ ADMIN SIGNUP CONSOLE ⭐"));

let db: any = null;

// MongoDB connection
MongoClient.connect("mongodb://localhost:27017/algovista")
  .then((conn) => {
    db = conn.db("algovista"); // make sure DB name matches
    createUser(); // start prompt after connection
  })
  .catch(() => {
    log(chalk.red.bold("\n ❌ Failed to connect database"));
    process.exit();
  });

// Role selection
const options: any = [
  {
    type: "list",
    name: "role",
    message: chalk.yellow("Press arrow up and down key to choose role -"),
    choices: ["User", "Admin", "Super Admin", "Exit"],
  },
];

// Input prompts
const input: any = [
  {
    type: "input",
    name: "fullname",
    message: "Enter your fullname ?",
    validate: (input: any) => (input.length > 0 ? true : "Fullname is required!"),
  },
  {
    type: "input",
    name: "email",
    message: "Enter your email ?",
    validate: (input: any) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!input.length) return "Email is required!";
      if (!emailRegex.test(input)) return "Enter valid email!";
      return true;
    },
  },
  {
    type: "password",
    name: "password",
    mask: "*",
    message: "Enter your password ?",
    validate: (input: any) => (!input.length ? "Password is required!" : true),
  },
];

// Add user
const addUser = async () => {
  try {
    const user = await inquirer.prompt(input);
    user.role = "user";
    user.password = await bcrypt.hash(user.password, 12);

    const userCollection = db.collection("users");
    await userCollection.insertOne(user);

    log(chalk.bgGreen("✅ User created successfully:"));
  } catch (err) {
    log(chalk.red("Failed to create user please consult to developer ", err));
  }
};

// Add admin
const addAdmin = async () => {
  try {
    const user = await inquirer.prompt(input);
    user.role = "admin";
    user.password = await bcrypt.hash(user.password, 12);

    const userCollection = db.collection("users");
    await userCollection.insertOne(user);

    log(chalk.bgGreen("✅ Admin created successfully:"));
  } catch (err) {
    log(chalk.red("Failed to create admin please consult to developer ", err));
  }
};

// Add super admin
const addSuperAdmin = async () => {
  try {
    const user = await inquirer.prompt(input);
    user.role = "super-admin";
    user.password = await bcrypt.hash(user.password, 12);

    const userCollection = db.collection("users");
    await userCollection.insertOne(user);

    log(chalk.bgGreen("✅ SuperAdmin created successfully:"));
  } catch (err) {
    log(chalk.red("Failed to create super admin please consult to developer ", err));
  }
};

// Exit
const exit = () => {
  log(chalk.blue("GoodBye! Exiting the program."));
  process.exit();
};

// Main function
const createUser = async () => {
  try {
    const option = await inquirer.prompt(options);

    if (option.role === "User") return addUser();
    if (option.role === "Admin") return addAdmin();
    if (option.role === "Super Admin") return addSuperAdmin();
    if (option.role === "Exit") return exit();
  } catch (err) {
    log(chalk.red("Something is not right!", err));
  }
};
