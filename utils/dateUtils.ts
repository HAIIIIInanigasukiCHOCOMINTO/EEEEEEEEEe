export const getDateFromDay = (day: number, startDateISO: string): Date => {
    const startDate = new Date(startDateISO);
    const resultDate = new Date(startDate);
    resultDate.setDate(startDate.getDate() + day);
    return resultDate;
};

export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};
