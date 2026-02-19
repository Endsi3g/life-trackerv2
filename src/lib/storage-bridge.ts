
// Mock storage for window.storage used in backup
if (!(window as any).storage) {
    (window as any).storage = {
        get: async (key: string) => {
            const val = localStorage.getItem(key);
            return val ? { value: val } : null;
        },
        set: async (key: string, val: string) => {
            localStorage.setItem(key, val);
        }
    };
}

export { };
