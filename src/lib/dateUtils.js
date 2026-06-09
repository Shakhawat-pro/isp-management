const DATE_FORMAT_OPTIONS = {
    day: "numeric",
    month: "long",
    year: "numeric",
};

export const parseFlexibleDate = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value)) return value;

    const text = value.toString().replace(/"/g, "").trim();
    if (!text) return null;

    let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        return new Date(year, month - 1, day);
    }

    match = text.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
    if (match) {
        let year = Number(match[3]);
        if (year < 100) year += 2000;
        const month = Number(match[2]);
        const day = Number(match[1]);
        return new Date(year, month - 1, day);
    }

    const fallback = new Date(text);
    return Number.isNaN(fallback) ? null : fallback;
};

export const formatDisplayDate = (value) => {
    const date = parseFlexibleDate(value);
    if (!date) return "";
    return new Intl.DateTimeFormat("en-GB", DATE_FORMAT_OPTIONS).format(date);
};

export const formatStorageDate = (value) => {
    const date = parseFlexibleDate(value);
    if (!date) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};