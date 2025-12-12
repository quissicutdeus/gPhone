/**
 * Simple wrapper around fetch API tailored for CEF/NUI use.
 * @param eventName - The endpoint eventname to target
 * @param data - Data you wish to send in the NUI Callback
 * @param mockData - Mock data to be returned if in the browser
 * @return returnData - A promise for the data sent back by the Nui Callbacks
 */
export async function fetchNui<T = any>(eventName: string, data?: any, mockData?: T): Promise<T> {
    const options = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    };

    if (isBrowser() && mockData) {
        return new Promise((resolve) => setTimeout(() => resolve(mockData), 1000));
    }

    const resourceName = (window as any).GetParentResourceName ? (window as any).GetParentResourceName() : 'nui-frame-app';

    const resp = await fetch(`https://${resourceName}/${eventName}`, options);

    try {
        const respFormatted = await resp.json();
        return respFormatted;
    } catch (e) {
        // If the response is not valid JSON (or empty), return null or the raw text if needed.
        // For NUI callbacks that don't return data (just status OK), this is common.
        // We'll return null to avoid the error.
        return null as unknown as T;
    }
}

export const isBrowser = () => !(window as any).invokeNative;
