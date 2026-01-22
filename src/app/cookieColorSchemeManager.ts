import {
  isMantineColorScheme,
  type MantineColorScheme,
  type MantineColorSchemeManager,
} from "@mantine/core";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function cookieColorSchemeManager(
  key = "mantine-color-scheme",
): MantineColorSchemeManager {
  return {
    get: (defaultValue: MantineColorScheme) => {
      const value = getCookie(key);
      return isMantineColorScheme(value) ? value : defaultValue;
    },

    set: (value: MantineColorScheme) => {
      setCookie(key, value);
    },

    clear: () => {
      removeCookie(key);
    },
    
    subscribe: () => {},
    unsubscribe: () => {},
  };
}
