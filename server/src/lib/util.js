export const getNestedValue = (obj, path) => {
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
};
