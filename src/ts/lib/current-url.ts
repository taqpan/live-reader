export const currentUrl = async (): Promise<string | undefined> => {
    if (chrome && chrome.tabs && chrome.tabs.query) {
        return new Promise<string | undefined>((resolve, reject) => {
            chrome.tabs.query({ 'active': true, 'currentWindow': true }, (tabs) => {
                if (tabs && tabs.length) {
                    resolve(tabs[0].url);
                }
                reject();
            });
        });
    }
};
