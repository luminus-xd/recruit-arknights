const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const toJapaneseDateLabel = (isoDate: string) => {
    if (ISO_DATE_PATTERN.test(isoDate)) {
        return isoDate;
    }

    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
        return isoDate;
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};
