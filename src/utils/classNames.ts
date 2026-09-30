export function classNames(...values: Array<string | false | null | undefined>): string | undefined {
    const classes = values.filter(Boolean).join(' ');
    return classes.length > 0 ? classes : undefined;
}
