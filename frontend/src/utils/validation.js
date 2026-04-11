export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) =>
  password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

export const validateUsername = (username) =>
  username.length >= 3 && username.length <= 30 && !/\s/.test(username);

export const validateTaskTitle = (title) =>
  title.length >= 1 && title.length <= 255;

export const validateTaskDescription = (description) =>
  !description || description.length <= 2000;

export const validateCategoryName = (name) =>
  name.length >= 1 && name.length <= 50;

export const validateTagName = (name) =>
  name.length >= 1 && name.length <= 30;
