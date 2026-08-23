export function removeEmptyValues<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    const filteredArray = obj
      .map((item) => removeEmptyValues(item))
      .filter((item) => {
        if (typeof item === "object" && item !== null) {
          return Object.keys(item).length > 0;
        }
        return item !== "" && item !== null && item !== undefined;
      });
    return filteredArray as T;
  }

  const result: Record<string, unknown> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as Record<string, unknown>)[key];
      const cleanedValue = removeEmptyValues(value);

      // Skip null dan undefined
      if (cleanedValue === null || cleanedValue === undefined) {
        continue;
      }

      // Skip empty string
      if (cleanedValue === "") {
        continue;
      }

      // Skip empty array
      if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
        continue;
      }

      // Skip empty object
      if (
        typeof cleanedValue === "object" &&
        !Array.isArray(cleanedValue) &&
        Object.keys(cleanedValue).length === 0
      ) {
        continue;
      }

      result[key] = cleanedValue;
    }
  }

  return result as T;
}
