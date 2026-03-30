import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
type AnyObject = Record<string, any>;

export const generateQueryString = (
  params: AnyObject,
  checkNullish: boolean = true,
): string => {
  const queryString = Object.keys(params)
    .map((key) => {
      const value = params[key];

      const checkIfArray = (value: any, key: string) => {
        if (Array.isArray(value)) return `${key}=${value.join(",")}`;
        else return `${key}=${value.toString()}`;
      };

      if (checkNullish) {
        if (value !== null && value !== undefined && value.toString() !== "") {
          return checkIfArray(value, key);
        }
        return "";
      } else return checkIfArray(value, key);
    })
    .filter((param) => (checkNullish ? param !== "" : true))
    .join("&");

  return queryString ? `?${queryString}` : "";
};
