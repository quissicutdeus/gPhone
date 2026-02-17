import { isBrowser } from './isBrowser';
import { getMockData } from '../mocks/registry';

/**
 * Simple wrapper around fetch API tailored for CEF/NUI use.
 * @param eventName - The endpoint eventname to target
 * @param data - Data you wish to send in the NUI Callback
 * @param options - Options for the request, including default value for safety
 * @return returnData - A promise for the data sent back by the Nui Callbacks
 */
export async function fetchNui<T = any>(
    eventName: string,
    data?: any,
    options?: { defaultValue?: T }
): Promise<T> {
    const fetchOptions = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    };

    if (isBrowser()) {
        const mock = await getMockData(eventName, data);
        return mock ?? options?.defaultValue ?? null as unknown as T;
    }

    const resourceName = (window as any).GetParentResourceName ? (window as any).GetParentResourceName() : 'nui-frame-app';

    try {
        const resp = await fetch(`https://${resourceName}/${eventName}`, fetchOptions);
        const respFormatted = await resp.json();

        // Return default value if response is null/undefined and default is provided
        if (options?.defaultValue !== undefined) {
            if (respFormatted === null || respFormatted === undefined) {
                return options.defaultValue;
            }
            // If default value is an array, ensure response is an array
            if (Array.isArray(options.defaultValue) && !Array.isArray(respFormatted)) {
                return options.defaultValue;
            }
        }

        return respFormatted;
    } catch (e) {
        // If the response is not valid JSON (or empty), return default value or null.
        if (options?.defaultValue !== undefined) {
            return options.defaultValue;
        }
        return null as unknown as T;
    }
}

export { isBrowser };            
