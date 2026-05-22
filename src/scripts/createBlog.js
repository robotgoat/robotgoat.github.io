// Helper script to automatically generate markdown file from command line
// takes two arguments: blog title, "blog description"
// third argument "d" is optional. use if need to make a directory for the post itself
// description is in quotes

import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The directory where all blog markdown files go
const blogPath = path.join(__dirname, "..", "content", "blog");

// Get current date information
const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1;
const year = today.getFullYear();

const enteredInput = process.argv.slice(2);

function parseCMD() {
  console.log(enteredInput);
  let dDex = -1;
  let isPostDir = false;

  if (enteredInput.includes("d")) {
    console.log("Make a folder for the blog post");
    dDex = enteredInput.indexOf("d");

    if (dDex === 0) {
      enteredInput.shift();
    } else if (dDex === enteredInput.length - 1) {
      enteredInput.pop();
    }
  }
  if (dDex !== -1) {
    isPostDir = true;
  }
  return isPostDir;
}

function createFileBaseName() {
  const fileName =
    year.toString() +
    "-" +
    month.toString().padStart(2, "0") +
    "-" +
    day.toString().padStart(2, "0") +
    "_" +
    enteredInput[0].toLowerCase().replace(/ /g, "_");

  return fileName;
}

function createFrontMatter() {
  const frontMatter = `---
title: ${enteredInput[0]}
description: ${enteredInput[1]}
pubDate: ${today.toDateString().slice(4)}
heroImage: ""
tags: ["musings"]
---
    `;

  return frontMatter;
}

function createNewBlogPost(isMakePostDir, fileBaseName, frontMatter) {
  // first check if need to make a folder for a new year
  const yearDirectory = path.join(blogPath, year.toString());

  let blogDirPaths = path.join(yearDirectory);
  console.log(blogDirPaths);

  try {
    if (!fs.existsSync(yearDirectory)) {
      console.log(
        `The directory for ${year.toString()} doesnt exist, making directory`,
      );
      fs.mkdirSync(yearDirectory);
    } else {
      console.log(
        `The ${year.toString()} directory exists. Proceeding to make file.`,
      );
    }
  } catch (err) {
    console.error(err);
  }

  // then check if need to make a folder for the post
  try {
    if (isMakePostDir) {
      console.log("Making a folder for the post");
      blogDirPaths = path.join(blogDirPaths, fileBaseName);
      fs.mkdirSync(blogDirPaths);
    } else {
      console.log("Not creating folder for the post");
    }
  } catch (err) {
    console.error(err);
  }

  // // Lastly create the file
  blogDirPaths = path.join(blogDirPaths, fileBaseName + ".md");
  console.log(blogDirPaths);
  try {
    if (!fs.existsSync(blogDirPaths)) {
      fs.writeFileSync(blogDirPaths, frontMatter);
      console.log(`Successfully created new blog post at ${blogDirPaths}`);
    } else {
      console.log("The post you are attempting to create already exists!");
    }
  } catch (err) {
    console.error(err);
  }
}

function createBlog() {
  console.log(`Today is ${today.toDateString().slice(4)}`);

  const isMakePostDir = parseCMD();
  const fileBaseName = createFileBaseName();
  const frontMatter = createFrontMatter();

  createNewBlogPost(isMakePostDir, fileBaseName, frontMatter);
}

createBlog();
