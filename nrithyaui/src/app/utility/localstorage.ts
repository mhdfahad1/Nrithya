export class LocalStorage {
    static isServer = () => typeof window === "undefined";
    static setItem = (key: string, value: any) => {
      return !LocalStorage.isServer() && localStorage.setItem(key, value);
    };
    static getItem = (key: string) => {
      return !LocalStorage.isServer() && localStorage.getItem(key);
    };
    static clear = () => {
      return !LocalStorage.isServer() && localStorage.clear();
    };
  }