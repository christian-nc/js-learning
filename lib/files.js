const fs = require("fs");

// Input: a file path and a value to save as JSON.
// Output: nothing (undefined).
// Bad Input: if the value is not valid JSON, throw an Error with a message indicating that there is nothing to save. Do not write the file.
// Empty Input: if the value is undefined, it is considered invalid and will throw an Error with a message indicating that there is nothing to save.
function saveJson(filePath, data) {
  const text = JSON.stringify(data, null, 2);
  if (typeof text !== "string") {
    throw new Error("Nothing to save: data is not JSON");
  }
  fs.writeFileSync(filePath, text + "\n", "utf8");
}

// Input: a file path and a fallback value.
// Output: the parsed JSON from the file, or the fallback if the file is missing.
// Bad Input: if the file exists but contains invalid JSON, throw an Error with a message indicating that the JSON is corrupt and include the original error as the cause. If there is any other error reading the file, rethrow it.
// Empty Input: if the file is empty, it is considered corrupt and will throw an Error with a message indicating that the JSON is corrupt.
function loadJson(filePath, fallback) {
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Corrupt JSON in ${filePath}`, { cause: error });
  }
}

module.exports = {
  saveJson,
  loadJson,
};
