import chalk from "chalk";
import inquirer from "inquirer";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { sendCredentialsMail } from "../utils/mail";


// Load .env
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const log = console.log;

log(chalk.bgRed.white.bold.underline("⭐ ADMIN SIGNUP CONSOLE ⭐"));

const DB_URL = "mongodb+srv://mishrasubhradip2005_db_user:Subhradip%407781@cluster0.knrtn05.mongodb.net/Algovista?retryWrites=true&w=majority";

if (!DB_URL) {
  console.log("❌ DB_URL is missing from .env");
  process.exit(1);
}

let db: any = null;

MongoClient.connect(DB_URL)
  .then((client) => {
    console.log("✅ Connected to MongoDB Atlas");

    // Use the same database name that's in your connection string
    db = client.db("Algovista");

    createUser();
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:");
    console.error(err);
    process.exit(1);
  });

/* ------------------ Role Selection ------------------ */
const options: any = [
  {
    type: "list",
    name: "role",
    message: chalk.yellow("Press arrow up and down key to choose role -"),
    choices: ["User", "Admin", "Super Admin", "Exit"],
  },
];

/* ------------------ User Inputs ------------------ */
const input: any = [
  {
    type: "input",
    name: "fullname",
    message: "Enter your fullname ?",
    validate: (v: any) => (v.length ? true : "Fullname is required!"),
  },
  {
    type: "input",
    name: "email",
    message: "Enter your email ?",
    validate: (v: any) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!v.length) return "Email is required!";
      if (!emailRegex.test(v)) return "Enter valid email!";
      return true;
    },
  },
  {
    type: "password",
    name: "password",
    mask: "*",
    message: "Enter your password ?",
    validate: (v: any) => (v.length ? true : "Password is required!"),
  },
];

/* ------------------ Admin Inputs (No Password) ------------------ */
const adminInput: any = [
  {
    type: "input",
    name: "fullname",
    message: "Enter fullname ?",
    validate: (v: any) => (v.length ? true : "Fullname is required!"),
  },
  {
    type: "input",
    name: "email",
    message: "Enter email ?",
    validate: (v: any) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!v.length) return "Email is required!";
      if (!emailRegex.test(v)) return "Enter valid email!";
      return true;
    },
  },
];

/* ------------------ Utils ------------------ */
const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
  const length = Math.floor(Math.random() * 3) + 8; // 8–10
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};

const sendEmail = async (user: any, plainPassword: string) => {
  await sendCredentialsMail(user.email, user.fullname, plainPassword);
};

/* ------------------ Base User Object (Schema Defaults) ------------------ */
const baseUser = {
  education: "",
  skills: [],
  experience: "",
  description: "",
  profileImage: "",
  socialLinks: {
    linkedin: "",
    github: "",
    website: "",
  },
  active: true,
  createdBy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/* ------------------ Add User ------------------ */
const addUser = async () => {
  try {
    const user = await inquirer.prompt(input);

    const hashedPassword = await bcrypt.hash(user.password, 12);

    await db.collection("users").insertOne({
      fullname: user.fullname,
      email: user.email,
      password: hashedPassword,
      role: "user",
      ...baseUser,
    });

    await sendEmail(user, user.password);

    log(chalk.bgGreen("✅ User created successfully"));
  } catch (err) {
    log(chalk.red("❌ Failed to create user"), err);
  }
};

/* ------------------ Add Admin ------------------ */
const addAdmin = async () => {
  try {
    const user = await inquirer.prompt(adminInput);
    const defaultPassword = generatePassword();

    await db.collection("users").insertOne({
      fullname: user.fullname,
      email: user.email,
      password: await bcrypt.hash(defaultPassword, 12),
      role: "admin",
      ...baseUser,
    });

    await sendEmail(user, defaultPassword);

    log(chalk.bgGreen("✅ Admin created (default password sent)"));
  } catch (err) {
    log(chalk.red("❌ Failed to create admin"), err);
  }
};

/* ------------------ Add Super Admin ------------------ */
const addSuperAdmin = async () => {
  try {
    const user = await inquirer.prompt(adminInput);
    const defaultPassword = generatePassword();

    await db.collection("users").insertOne({
      fullname: user.fullname,
      email: user.email,
      password: await bcrypt.hash(defaultPassword, 12),
      role: "super-admin",
      ...baseUser,
    });

    await sendEmail(user, defaultPassword);

    log(chalk.bgGreen("✅ Super Admin created (default password sent)"));
  } catch (err) {
    log(chalk.red("❌ Failed to create super admin"), err);
  }
};

/* ------------------ Exit ------------------ */
const exit = () => {
  log(chalk.blue("👋 Goodbye!"));
  process.exit();
};

/* ------------------ Main Menu ------------------ */
const createUser = async () => {
  try {
    const option = await inquirer.prompt(options);

    if (option.role === "User") return addUser();
    if (option.role === "Admin") return addAdmin();
    if (option.role === "Super Admin") return addSuperAdmin();
    if (option.role === "Exit") return exit();
  } catch (err) {
    log(chalk.red("❌ Something went wrong"), err);
  }
};
