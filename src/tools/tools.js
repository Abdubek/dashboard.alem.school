// Tools contains functions to format numbers and dates

// zero padding for numbee, e.g. zeroPad(7, 3) = 007
export const zeroPad = (num, places) => String(num).padStart(places, '0')

// formatDate formats js Date object to "yyyy.mm.dd"
export function formatDate(date) {
    return `${zeroPad(date.getDate(), 2)}.${zeroPad(date.getMonth()+1, 2)}.${date.getFullYear()}`;
}